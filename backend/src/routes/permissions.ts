import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const modeSchema = z.enum(['readOnly', 'readWrite', 'delete']).default('readOnly');

export const permissionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/v1/pages', { preHandler: [fastify.authenticate] }, async () => {
    return fastify.prisma.page.findMany({ orderBy: { sortOrder: 'asc' } });
  });

  fastify.get('/api/v1/permissions/can-access', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const querySchema = z.object({ pageId: z.string().min(1), mode: modeSchema.optional() });
    const query = querySchema.parse(request.query);

    await fastify.ensurePageAccess(request, reply, query.pageId, query.mode ?? 'readOnly');
    return { allowed: true };
  });
};
