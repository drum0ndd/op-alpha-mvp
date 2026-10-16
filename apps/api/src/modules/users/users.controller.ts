import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { SessionGuard, type AuthRequest } from '../auth/session.guard.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get('me/profile') @UseGuards(SessionGuard)
  @ApiResponse({ status: 200, description: 'Conta, cartas, decks ativos e contagem da watchlist do usuário autenticado.' })
  @ApiResponse({ status: 401, description: 'Sessão ausente ou expirada.' })
  profile(@Req() request: AuthRequest) { return this.service.profile(request.userId); }
  @Post()
  @ApiBody({ schema: { type: 'object', additionalProperties: false, required: ['name', 'email', 'password'], properties: {
    name: { type: 'string', maxLength: 100 }, email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 12, maxLength: 128, writeOnly: true },
  } } })
  @ApiResponse({ status: 201, description: 'Usuário criado; somente id, name, email e createdAt.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  create(@Body() body: unknown) { return this.service.create(body); }
}
