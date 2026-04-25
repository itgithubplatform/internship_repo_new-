import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { formRouter } from './routes/form.routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.FORM_SERVICE_PORT || 4005;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'form-service', status: 'ok', ts: new Date().toISOString() });
});

app.use('/form', formRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('[form-service] Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`[form-service] Running on port ${PORT}`);
});

export default app;
