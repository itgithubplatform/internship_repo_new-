import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { userRouter } from './routes/user.routes';
import { tenantMiddleware } from '@platform/tenant-core';

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 4002;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(tenantMiddleware); // Secure user routing

// 7.2 User Management Routes
app.use('/', userRouter);

app.listen(PORT, () => {
  console.log(`[user-service] Running on port ${PORT}`);
});

export default app;
