import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { AuthModule } from '../auth/auth.module.js';
@Module({ imports: [AuthModule], controllers: [UsersController], providers: [UsersService, UsersRepository] })
export class UsersModule {}
