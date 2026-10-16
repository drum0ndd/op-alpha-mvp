import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CollectionController } from './collection.controller.js';
import { CollectionService } from './collection.service.js';

@Module({ imports: [AuthModule], controllers: [CollectionController], providers: [CollectionService] })
export class CollectionModule {}
