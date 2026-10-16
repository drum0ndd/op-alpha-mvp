import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ bodyLimit: 32768, logger: { redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'] } }));
  app.getHttpAdapter().getInstance().addHook('onSend', async (_request, reply, payload) => { reply.header('Cache-Control', 'no-store'); return payload; });
  app.setGlobalPrefix('v1');
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()).filter(Boolean) ?? ['http://localhost:8081'], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();

  const config = new DocumentBuilder().setTitle('OP Alpha API').setDescription('Protótipo de catálogo, coleção e identidade').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document, { jsonDocumentUrl: 'v1/docs/openapi.json' });

  await app.listen({ port: Number(process.env.PORT ?? 3333), host: '0.0.0.0' });
}
bootstrap();
