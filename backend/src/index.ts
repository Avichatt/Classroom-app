// ============================================
// Server Entry Point
// ============================================
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { verifyAccessToken } from './utils/jwt';

const server = createServer(app);

// Socket.io Setup
export const io = new Server(server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
});

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        const payload = verifyAccessToken(token);
        (socket as any).user = payload;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    const userId = (socket as any).user.sub;
    socket.join(`user:${userId}`);

    if (env.isDev) {
        console.log(`Socket connected: ${socket.id} (User: ${userId})`);
    }

    socket.on('disconnect', () => {
        if (env.isDev) {
            console.log(`Socket disconnected: ${socket.id}`);
        }
    });
});

// Boot the Server
async function bootstrap() {
    try {
        // Attempt DB connection
        await prisma.$connect();
        console.log('✅ Connected to Database');

        // Attempt Redis setup
        if (env.REDIS_URL) {
            const pubClient = createClient({ url: env.REDIS_URL });
            const subClient = pubClient.duplicate();

            pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
            subClient.on('error', (err) => console.error('Redis Sub Error:', err));

            await Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter(createAdapter(pubClient, subClient));
            console.log('✅ Connected to Redis (Socket.IO Adapter)');
        } else {
            console.log('⚠️ REDIS_URL not set: Socket.io running in memory-only mode');
        }

        server.listen(env.PORT, () => {
            console.log(`\n🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
            console.log(`📡 Health Check: http://localhost:${env.PORT}/health`);
            console.log(`🔑 CORS allowed origin: ${env.CORS_ORIGIN}\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    server.close(() => console.log('HTTP server closed'));
});

bootstrap();
