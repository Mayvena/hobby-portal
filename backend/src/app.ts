import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { env } from './env.js';
import { prismaPlugin } from './plugins/prisma.js';
import { authPlugin } from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { roleRoutes } from './routes/roles.js';
import { permissionRoutes } from './routes/permissions.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined
    }
  });

  await app.register(sensible);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true
  });

  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(roleRoutes);
  await app.register(permissionRoutes);

  return app;
}
