import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import proxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { authMiddleware } from './middleware/auth.middleware';
import { licenseMiddleware } from './middleware/license.middleware';

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Rate limiting (basic anti-DDoS / brute force protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', status: 'ok', ts: new Date().toISOString() });
});

// ─── Service Routes Map ───────────────────────────────────────────────────────
const services = {
  auth:       process.env.AUTH_SERVICE_URL       || 'http://localhost:4001',
  users:      process.env.USER_SERVICE_URL       || 'http://localhost:4002',
  kyc:        process.env.KYC_SERVICE_URL        || 'http://localhost:4003',
  tenant:     process.env.TENANT_SERVICE_URL     || 'http://localhost:4004',
  form:       process.env.FORM_SERVICE_URL       || 'http://localhost:4005',
  submission: process.env.SUBMISSION_SERVICE_URL || 'http://localhost:4006',
  photo:      process.env.PHOTO_SERVICE_URL      || 'http://localhost:4007',
  license:    process.env.LICENSE_SERVICE_URL    || 'http://localhost:4008',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4009',
  admin:      process.env.ADMIN_SERVICE_URL      || 'http://localhost:4010',
};

// ─── Proxies ──────────────────────────────────────────────────────────────────

// 1. Auth Service (login/register) - bypasses license check, applies auth check only for protected routes
app.use('/auth', authMiddleware, proxy(services.auth, {
  proxyReqPathResolver: (req) => `/auth${req.url}`,
}));

// 2. Core services — protected by BOTH Auth and License middleware
const protectedServices = [
  { path: '/users',       target: services.users },
  { path: '/kyc',         target: services.kyc },
  { path: '/tenants',     target: services.tenant },
  { path: '/forms',       target: services.form },
  { path: '/submissions', target: services.submission },
  { path: '/photos',      target: services.photo },
  { path: '/license',     target: services.license },
  { path: '/notification', target: services.notification },
  { path: '/admin',       target: services.admin },
];

protectedServices.forEach(({ path, target }) => {
  app.use(
    path,
    authMiddleware,
    licenseMiddleware,
    proxy(target, {
      proxyReqPathResolver: (req) => `${path}${req.url}`,
      // Forward the user object as headers to internal services
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        if ((srcReq as any).user) {
          proxyReqOpts.headers = proxyReqOpts.headers || {};
          proxyReqOpts.headers['x-user-id'] = (srcReq as any).user.id;
          proxyReqOpts.headers['x-tenant-id'] = (srcReq as any).user.tenantId;
          proxyReqOpts.headers['x-user-role'] = (srcReq as any).user.role;
        }
        return proxyReqOpts;
      }
    })
  );
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Gateway route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`[api-gateway] Running on port ${PORT}`);
  logger.info(`[api-gateway] Routes mapped to internal services.`);
});

export default app;
