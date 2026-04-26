import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server as HttpServer } from 'http';

export async function setupWebSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    // Client can join a room based on their userId to receive targeted notifications
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('disconnect', () => {
      // Automatic cleanup
    });
  });

  return io;
}
