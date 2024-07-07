import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class FetchAchieveDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  gameId: number;
}
