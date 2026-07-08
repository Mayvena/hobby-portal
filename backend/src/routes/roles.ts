import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const roleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().default('')
});

const pageRolesSchema = z.object({ roleIds: z.array(z.string().min(1)) });

export const roleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/v1/roles', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'readOnly');
    return fastify.prisma.role.findMany({ orderBy: { label: 'asc' } });
  });

  fastify.post('/api/v1/roles', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'readWrite');
    const payload = roleSchema.parse(request.body);
    const created = await fastify.prisma.role.create({ data: payload });
    reply.code(201);
    return created;
  });

  fastify.patch('/api/v1/roles/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'readWrite');
    const payload = roleSchema.omit({ id: true }).parse(request.body);
    const { id } = request.params as { id: string };
    return fastify.prisma.role.update({ where: { id }, data: payload });
  });

  fastify.delete('/api/v1/roles/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'delete');
    const { id } = request.params as { id: string };
    if (id === 'admin') {
      throw fastify.httpErrors.badRequest('The admin role cannot be deleted.');
    }
    await fastify.prisma.role.delete({ where: { id } });
    reply.send({ ok: true });
  });

  fastify.get('/api/v1/permissions/role-page-access', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'readOnly');
    return fastify.prisma.rolePageAccess.findMany();
  });

  fastify.put('/api/v1/permissions/pages/:pageId/roles', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'readWrite');
    const { pageId } = request.params as { pageId: string };
    const payload = pageRolesSchema.parse(request.body);

    const roleIds = [...new Set(payload.roleIds)].sort();
    const finalRoleIds = roleIds.length === 0 ? [] : [...new Set(['admin', ...roleIds])].sort();

    await fastify.prisma.rolePageAccess.deleteMany({ where: { pageId } });
    if (finalRoleIds.length > 0) {
      await fastify.prisma.rolePageAccess.createMany({
        data: finalRoleIds.map((roleId) => ({ roleId, pageId })),
        skipDuplicates: true
      });
    }

    reply.send({ pageId, roleIds: finalRoleIds });
  });
};
