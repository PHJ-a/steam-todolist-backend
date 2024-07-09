import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class TodoParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  // todo id
  id: number;
}

export class TodoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'false') return false;
    if (value === 'true') return true;
    return value;
  })
  @IsBoolean()
  complete?: boolean;
}

export class TodoBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  // 도전과제 아이디
  id: number;
}
