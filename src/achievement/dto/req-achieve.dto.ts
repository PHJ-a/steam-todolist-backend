import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class FetchAchieveDto {
  @ApiProperty({ description: '도전과제를 가져올 게임아이디' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  gameId: number;
}
