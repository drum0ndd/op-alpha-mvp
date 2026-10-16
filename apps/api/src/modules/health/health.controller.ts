import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('ready') async readiness() {
    try { await this.prisma.$queryRaw`SELECT 1`; }
    catch { throw new ServiceUnavailableException('Banco de dados indisponível. Tente novamente mais tarde.'); }
    return { status: 'ok', database: 'connected' };
  }
  @Get() getHealth() { return { status: 'ok', service: 'op-alpha-api', at: new Date().toISOString() }; }
}
