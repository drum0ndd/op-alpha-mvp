import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service.js';
import { ListCardsDto } from './dto/list-cards.dto.js';
@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}
  @Get() list(@Query() query: ListCardsDto) { return this.service.list(query); }
  @Get(':id') detail(@Param('id') identifier: string) { return this.service.detail(identifier); }
}
