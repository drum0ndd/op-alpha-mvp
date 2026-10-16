import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
@Injectable()
export class RequestSecurityGuard implements CanActivate {
  private attempts = new Map<string, { count: number; until: number }>();
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const allowed = (process.env.CORS_ORIGIN ?? 'http://localhost:8081').split(',').map(s => s.trim());
      if ((req.headers.origin && !allowed.includes(req.headers.origin)) || req.headers['x-op-client'] !== '1') throw new ForbiddenException('Origem da solicitação não permitida.');
    }
    if (req.method === 'POST' && ['/v1/users', '/v1/auth/login'].includes(req.url.split('?')[0])) {
      const now = Date.now();
      for (const [key, entry] of this.attempts) if (entry.until <= now) this.attempts.delete(key);
      const key = req.ip; // trustProxy remains disabled; forwarded headers cannot bypass the limit.
      const entry = this.attempts.get(key) ?? { count: 0, until: now + 15 * 60000 };
      if (this.attempts.size >= 10000 && !this.attempts.has(key)) throw new HttpException('Tente novamente mais tarde.', 429);
      entry.count++; this.attempts.set(key, entry);
      if (entry.count > 20) throw new HttpException('Muitas tentativas. Aguarde 15 minutos.', 429);
    }
    return true;
  }
}
