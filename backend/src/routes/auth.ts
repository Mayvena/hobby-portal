import argon2 from 'argon2';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../env.js';
import { createOpaqueToken, hashOpaqueToken } from '../services/tokenService.js';
import { toUserView } from '../services/userView.js';

const refreshCookieName = 'relib_refresh_token';
const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

function refreshExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_DAYS);
  return expiresAt;
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/v1/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await fastify.prisma.user.findUnique({ where: { username: body.username } });
    if (!user || !user.active) {
      reply.unauthorized('Invalid credentials.');
      return;
    }

    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) {
      reply.unauthorized('Invalid credentials.');
      return;
    }

    const roleRows = await fastify.prisma.userRole.findMany({ where: { userId: user.id }, select: { roleId: true } });
    const roleIds = roleRows.map((item: { roleId: string }) => item.roleId);

    const accessToken = fastify.jwt.sign(
      { uid: user.id, username: user.username, accessLevel: user.accessLevel, roleIds },
      { expiresIn: env.ACCESS_TOKEN_TTL }
    );

    const refreshToken = createOpaqueToken();
    await fastify.prisma.refreshToken.create({
      data: {
        tokenHash: hashOpaqueToken(refreshToken),
        userId: user.id,
        expiresAt: refreshExpiryDate()
      }
    });

    reply.setCookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      expires: refreshExpiryDate()
    });

    reply.send({
      accessToken,
      user: toUserView(user, roleIds)
    });
  });

  fastify.post('/api/v1/auth/refresh', async (request, reply) => {
    const token = request.cookies[refreshCookieName];
    if (!token) {
      reply.unauthorized('Missing refresh token.');
      return;
    }

    const tokenHash = hashOpaqueToken(token);
    const tokenRow = await fastify.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!tokenRow || tokenRow.revokedAt || tokenRow.expiresAt < new Date()) {
      reply.unauthorized('Invalid refresh token.');
      return;
    }

    const user = await fastify.prisma.user.findUnique({ where: { id: tokenRow.userId } });
    if (!user || !user.active) {
      reply.unauthorized('Session no longer valid.');
      return;
    }

    await fastify.prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date() }
    });

    const roleRows = await fastify.prisma.userRole.findMany({ where: { userId: user.id }, select: { roleId: true } });
    const roleIds = roleRows.map((item: { roleId: string }) => item.roleId);
    const accessToken = fastify.jwt.sign(
      { uid: user.id, username: user.username, accessLevel: user.accessLevel, roleIds },
      { expiresIn: env.ACCESS_TOKEN_TTL }
    );

    const newRefreshToken = createOpaqueToken();
    await fastify.prisma.refreshToken.create({
      data: {
        tokenHash: hashOpaqueToken(newRefreshToken),
        userId: user.id,
        expiresAt: refreshExpiryDate()
      }
    });

    reply.setCookie(refreshCookieName, newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      expires: refreshExpiryDate()
    });

    reply.send({
      accessToken,
      user: toUserView(user, roleIds)
    });
  });

  fastify.post('/api/v1/auth/logout', async (request, reply) => {
    const token = request.cookies[refreshCookieName];
    if (token) {
      await fastify.prisma.refreshToken.updateMany({
        where: { tokenHash: hashOpaqueToken(token), revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    reply.clearCookie(refreshCookieName, { path: '/api/v1/auth' });
    reply.send({ ok: true });
  });

  fastify.get('/api/v1/auth/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const user = await fastify.prisma.user.findUnique({ where: { id: request.user.uid } });
    if (!user) {
      throw fastify.httpErrors.notFound('User not found.');
    }

    const roleRows = await fastify.prisma.userRole.findMany({ where: { userId: user.id }, select: { roleId: true } });
    return { user: toUserView(user, roleRows.map((item: { roleId: string }) => item.roleId)) };
  });
};
