import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionGuard, type AuthRequest } from '../auth/session.guard.js';
import { CollectionService } from './collection.service.js';

@ApiTags('collection')
@Controller('users/me/holdings')
@UseGuards(SessionGuard)
export class CollectionController {
  constructor(private readonly collection: CollectionService) {}
  @Post()
  create(@Req() request: AuthRequest, @Body() body: unknown) {
    return this.collection.create(request.userId, body);
  }
}
