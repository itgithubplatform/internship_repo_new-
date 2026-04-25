import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { photoRouter } from './routes/photo.routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PHOTO_SERVICE_PORT || 4007;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'photo-service', status: 'ok', ts: new Date().toISOString() });
});

app.use('/photo', photoRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Catch Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  logger.error('[photo-service] Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`[photo-service] Running on port ${PORT}`);
});

export default app;
