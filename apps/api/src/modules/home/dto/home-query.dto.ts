import { LensSchema, type Lens } from '@op-alpha/contracts';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
export class HomeQueryDto {
  @IsIn(LensSchema.options) lens!: Lens;
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 6;
}
