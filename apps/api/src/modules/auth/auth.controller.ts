import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService, cookieName } from './auth.service.js';
import { SessionGuard, type AuthRequest } from './session.guard.js';
function cookie(token: string, age: number) {
  return `${cookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') @HttpCode(200)
  async login(@Body() body: unknown, @Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const token = await this.auth.login(body, request);
    reply.header('Set-Cookie', cookie(token, 7 * 86400));
    reply.header('Cache-Control', 'no-store');
    return { authenticated: true };
  }
  @Post('logout') @HttpCode(200)
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.auth.logout(request);
    reply.header('Set-Cookie', cookie('', 0));
    return { authenticated: false };
  }
  @Get('me') @UseGuards(SessionGuard)
  me(@Req() request: AuthRequest) { return this.auth.me(request.userId); }
}
