import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient, NotificationStatus, NotificationChannel, NotificationType } from '@prisma/client';
import { createServer } from 'http';
import { setupWebSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.NOTIFICATION_PORT || 3000;
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

let io: any = null;

app.post('/api/notifications', async (req: Request, res: Response) => {
  try {
    const { recipientId, tenantId, channel, type, subject, body, metadata } = req.body;

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        tenantId,
        channel: channel as NotificationChannel,
        type: type as NotificationType,
        subject,
        body,
        metadata: metadata || {},
        status: NotificationStatus.PENDING
      }
    });

    // Emit to connected user via WebSocket
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', notification);
    }

    console.log(`[Notification] Created: ${type} via ${channel} for ${recipientId}`);

    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error('[Notification Error]', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

setupWebSocket(httpServer).then(ws => {
  io = ws;
}).catch(console.error);

httpServer.listen(PORT, () => {
  console.log(`[notification-service] Running on port ${PORT}`);
});
