import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class ListCardsDto {
  @IsOptional() @IsString() @MaxLength(80) query?: string;
  @IsOptional() @IsString() @MaxLength(20) set?: string;
  @IsOptional() @IsIn(['EN', 'JP', 'PT']) language?: 'EN' | 'JP' | 'PT';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 24;
}
