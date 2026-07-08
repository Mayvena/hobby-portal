import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.get('/ready', async (_request, reply) => {
    await fastify.prisma.$queryRaw`SELECT 1`;
    reply.send({ status: 'ready' });
  });
};
