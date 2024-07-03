import { Controller, Get, Param } from '@nestjs/common';
import { AchievementService } from './achievement.service';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('fetch/:gameId')
  async fetchAchievement(@Param('gameId') gameId: string) {
    const result = await this.achievementService.fetchAchievement(+gameId);
    await this.achievementService.fetchCompletedRate(+gameId);
    return result;
  }
  @Get(':userId/:gameId')
  async fetchUserAchievement(
    @Param('userId') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.achievementService.getAllAchievementAboutUser(+gameId, userId);
  }
}
