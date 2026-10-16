import { AuthModule } from './modules/auth/auth.module.js';
import { RequestSecurityGuard } from './common/request-security.guard.js';
import { UsersModule } from './modules/users/users.module.js';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ApiErrorFilter } from './common/api-error.filter.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { CardsModule } from './modules/cards/cards.module.js';
import { HomeModule } from './modules/home/home.module.js';
import { CollectionModule } from './modules/collection/collection.module.js';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }), PrismaModule, HealthModule, CardsModule, HomeModule, UsersModule, AuthModule, CollectionModule],
  providers: [{ provide: APP_GUARD, useClass: RequestSecurityGuard }, { provide: APP_FILTER, useClass: ApiErrorFilter }],
})
export class AppModule {}
