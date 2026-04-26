import express from 'express';
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

app.post('/api/notifications', async (req, res) => {
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

    // In a real scenario, this is where we'd interface with an email provider (SendGrid, SES)
    // or push notification service (Firebase, APNs).
    // For now, we'll just log it.
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

let io: any = null;
setupWebSocket(httpServer).then(ws => {
  io = ws;
}).catch(console.error);

httpServer.listen(PORT, () => {
  console.log(`[notification-service] Running on port ${PORT}`);
});
