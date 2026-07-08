import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: any;
  }
}

const prismaModule = await import('@prisma/client');
const PrismaClientCtor = (prismaModule as any).PrismaClient ?? (prismaModule as any).default?.PrismaClient;

if (!PrismaClientCtor) {
  throw new Error('PrismaClient is unavailable. Run `npm run prisma:generate` before starting the backend.');
}

const prisma = new PrismaClientCtor();

export const prismaPlugin = fp(async (fastify) => {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
