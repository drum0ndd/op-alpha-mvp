import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiErrorFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    let statusCode = 500;
    let message: string | string[] = 'Erro interno. Tente novamente mais tarde.';
    if (error instanceof HttpException) {
      statusCode = error.getStatus();
      const response = error.getResponse();
      if (statusCode < 500 || statusCode === 503) {
        message = typeof response === 'string' ? response : (response as { message: string | string[] }).message;
      }
    } else if (typeof error === 'object' && error !== null && 'code' in error &&
      ['P1001', 'P1002', 'P1008', 'P1017', 'P2024', 'ECONNREFUSED', 'ETIMEDOUT'].includes(String(error.code))) {
      statusCode = 503;
      message = 'Banco de dados indisponível. Tente novamente mais tarde.';
    }
    if (statusCode >= 500) this.logger.error(`Request failed with status ${statusCode}`);
    host.switchToHttp().getResponse<FastifyReply>().status(statusCode).send({ statusCode, message });
  }
}
