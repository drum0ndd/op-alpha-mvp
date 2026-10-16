import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service.js';
import { HomeQueryDto } from './dto/home-query.dto.js';
@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly service: HomeService) {}
  @Get() getHome(@Query() query: HomeQueryDto) { return this.service.getHome(query); }
}
