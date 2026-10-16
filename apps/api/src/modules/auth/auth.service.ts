import { BadRequestException, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { LoginSchema } from '@op-alpha/contracts';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service.js';
import { validate } from '../../common/validation.js';
import { verifyPassword } from '../identity/password.js';
import { publicUser, publicUserSelect } from '../identity/public-user.js';
export const cookieName = () => process.env.NODE_ENV === 'production' ? '__Host-op_session' : 'op_session';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function sessionHash(request: FastifyRequest) {
  const token = request.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName()}=`))?.split('=')[1];
  return token && /^[a-f0-9]{64}$/.test(token) ? digest(token) : null;
}
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly prisma: PrismaService) {}
  async login(payload: unknown, request: FastifyRequest) {
    try {
      const input = validate(LoginSchema, payload);
      const user = await this.prisma.user.findFirst({
        where: { email: { equals: input.email, mode: 'insensitive' } }, select: { id: true, passwordHash: true },
      });
      const valid = await verifyPassword(input.password, user?.passwordHash ?? null);
      if (!valid || !user) throw new UnauthorizedException('E-mail ou senha inválidos.');
      const token = randomBytes(32).toString('hex');
      const old = sessionHash(request);
      await this.prisma.$transaction(async tx => {
        // Revoke the cookie being replaced even when the new login belongs to another user.
        if (old) await tx.session.deleteMany({ where: { tokenHash: old } });
        await tx.session.deleteMany({ where: { userId: user.id, expiresAt: { lte: new Date() } } });
        await tx.session.create({ data: { tokenHash: digest(token), userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) } });
      });
      this.logger.log({ event: 'auth.login', outcome: 'success' });
      return token;
    } catch (error) {
      const reason = error instanceof UnauthorizedException ? 'invalid_credentials'
        : error instanceof BadRequestException ? 'invalid_payload'
        : error instanceof ServiceUnavailableException ? 'busy' : 'unavailable';
      this.logger.warn({ event: 'auth.login', outcome: 'failure', reason });
      throw error;
    }
  }
  async identity(request: FastifyRequest) {
    const tokenHash = sessionHash(request);
    if (!tokenHash) throw new UnauthorizedException('Entre na sua conta.');
    const session = await this.prisma.session.findUnique({ where: { tokenHash }, select: { userId: true, expiresAt: true } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) this.logger.log({ event: 'auth.session_expired', outcome: 'rejected' });
      throw new UnauthorizedException('Sessão expirada. Entre novamente.');
    }
    return session.userId;
  }
  async logout(request: FastifyRequest) {
    try {
      const tokenHash = sessionHash(request);
      if (tokenHash) await this.prisma.session.deleteMany({ where: { tokenHash } });
      this.logger.log({ event: 'auth.logout', outcome: 'success' });
    } catch (error) {
      this.logger.warn({ event: 'auth.logout', outcome: 'failure', reason: 'unavailable' });
      throw error;
    }
  }
  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: publicUserSelect });
    return publicUser(user);
  }
}
