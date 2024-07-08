import { ApiProperty } from '@nestjs/swagger';

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
  completedRate: number;
}

export class AchieveFetchingDto {
  @ApiProperty({ type: [ResAchieveWithUserDto] })
  achievements: ResAchieveWithUserDto[];

  @ApiProperty()
  gameId: number;
}
