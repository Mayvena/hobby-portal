import argon2 from 'argon2';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { toUserView } from '../services/userView.js';

const userPayloadSchema = z.object({
  uid: z.string().min(1).optional(),
  name: z.string().min(1),
  age: z.number().int().nonnegative(),
  email: z.string().email(),
  username: z.string().min(1),
  accessLevel: z.number().int().min(1).max(3),
  roleIds: z.array(z.string().min(1)).default([]),
  password: z.string().min(1).optional()
});

const roleAssignmentSchema = z.object({ roleIds: z.array(z.string().min(1)) });

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/v1/users', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'userlist', 'readOnly');

    const users = await fastify.prisma.user.findMany({ orderBy: { name: 'asc' } });
    const userRoles = await fastify.prisma.userRole.findMany();
    const rolesByUser = new Map<string, string[]>();

    for (const row of userRoles) {
      const list = rolesByUser.get(row.userId) ?? [];
      list.push(row.roleId);
      rolesByUser.set(row.userId, list);
    }

    return users.map((user: { id: string; name: string; age: number; email: string; username: string; accessLevel: number }) =>
      toUserView(user, rolesByUser.get(user.id) ?? [])
    );
  });

  fastify.post('/api/v1/users', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'userlist', 'readWrite');
    const payload = userPayloadSchema.parse(request.body);
    const uid = payload.uid ?? `USR-${Date.now()}`;
    const passwordHash = await argon2.hash(payload.password ?? payload.username);

    const created = await fastify.prisma.user.create({
      data: {
        id: uid,
        name: payload.name,
        age: payload.age,
        email: payload.email,
        username: payload.username,
        passwordHash,
        accessLevel: payload.accessLevel
      }
    });

    if (payload.roleIds.length > 0) {
      await fastify.prisma.userRole.createMany({
        data: payload.roleIds.map((roleId) => ({ userId: created.id, roleId })),
        skipDuplicates: true
      });
    }

    reply.code(201);
    return toUserView(created, payload.roleIds);
  });

  fastify.patch('/api/v1/users/:uid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'userlist', 'readWrite');
    const payload = userPayloadSchema.parse(request.body);
    const { uid } = request.params as { uid: string };

    const existing = await fastify.prisma.user.findUnique({ where: { id: uid } });
    if (!existing) {
      throw fastify.httpErrors.notFound('User not found.');
    }

    const updated = await fastify.prisma.user.update({
      where: { id: uid },
      data: {
        name: payload.name,
        age: payload.age,
        email: payload.email,
        username: payload.username,
        accessLevel: payload.accessLevel,
        ...(payload.password ? { passwordHash: await argon2.hash(payload.password) } : {})
      }
    });

    await fastify.prisma.userRole.deleteMany({ where: { userId: uid } });
    if (payload.roleIds.length > 0) {
      await fastify.prisma.userRole.createMany({
        data: payload.roleIds.map((roleId) => ({ userId: uid, roleId })),
        skipDuplicates: true
      });
    }

    return toUserView(updated, payload.roleIds);
  });

  fastify.delete('/api/v1/users/:uid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'userlist', 'delete');
    const { uid } = request.params as { uid: string };
    await fastify.prisma.user.delete({ where: { id: uid } });
    reply.send({ ok: true });
  });

  fastify.put('/api/v1/users/:uid/roles', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    await fastify.ensurePageAccess(request, reply, 'rolesadmin', 'readWrite');
    const { uid } = request.params as { uid: string };
    const payload = roleAssignmentSchema.parse(request.body);

    await fastify.prisma.userRole.deleteMany({ where: { userId: uid } });
    if (payload.roleIds.length > 0) {
      await fastify.prisma.userRole.createMany({
        data: payload.roleIds.map((roleId) => ({ userId: uid, roleId })),
        skipDuplicates: true
      });
    }

    reply.send({ uid, roleIds: [...new Set(payload.roleIds)].sort() });
  });
};
