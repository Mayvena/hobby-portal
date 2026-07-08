import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import type { AccessMode, AuthUser } from '../types/auth.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
    ensurePageAccess: (
      request: import('fastify').FastifyRequest,
      reply: import('fastify').FastifyReply,
      pageId: string,
      mode?: AccessMode
    ) => Promise<void>;
  }
}

export const authPlugin = fp(async (fastify) => {
  await fastify.register(cookie);
  await fastify.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET ?? 'dev-insecure-secret'
  });

  fastify.decorate('authenticate', async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      reply.unauthorized('Authentication required.');
    }
  });

  fastify.decorate('ensurePageAccess', async function ensurePageAccess(request, reply, pageId, mode = 'readOnly') {
    const user = request.user;
    if (!user) {
      reply.unauthorized('Authentication required.');
      return;
    }

    const roleMappings = await fastify.prisma.rolePageAccess.findMany({
      where: { pageId },
      select: { roleId: true }
    });

    const roleGate = roleMappings.map((item: { roleId: string }) => item.roleId);
    if (roleGate.length > 0 && !user.roleIds.some((roleId) => roleGate.includes(roleId))) {
      reply.forbidden('Role does not permit access to this page.');
      return;
    }

    const rights = await fastify.prisma.userRight.findUnique({ where: { pageId } });
    if (!rights) {
      reply.forbidden('No rights definition found for page.');
      return;
    }

    const levels = mode === 'readOnly' ? rights.readOnly : mode === 'readWrite' ? rights.readWrite : rights.deleteLevel;
    if (!levels.includes(user.accessLevel)) {
      reply.forbidden('Access level is not allowed for this operation.');
    }
  });
});
