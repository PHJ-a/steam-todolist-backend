import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ResAchieveWithUserDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: 1 })
  achieved: number;

  @ApiProperty()
  img: string;

  @ApiProperty({ example: '12.13' })
  completedRate: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== null ? new Date(value * 1000) : null))
  unlockTime: Date | null;
}

export class ResAchieveFetchingDto {
  @ApiProperty({ type: [ResAchieveWithUserDto] })
  achievements: ResAchieveWithUserDto[];

  @ApiProperty()
  gameId: number;
}
