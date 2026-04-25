import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { kycRouter } from './routes/kyc.routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.KYC_SERVICE_PORT || 4003;

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
// Increase limit for base64 document payloads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ service: 'kyc-service', status: 'ok', ts: new Date().toISOString() });
});

// ─── KYC Routes ───────────────────────────────────────────────────────────────
// All KYC endpoints are scoped under /kyc
app.use('/kyc', kycRouter);

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('[kyc-service] Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`[kyc-service] Running on port ${PORT}`);
});

export default app;
