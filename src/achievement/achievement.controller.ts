import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';

@Controller('achievement')
@UseGuards(AuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('fetch/:gameId')
  async fetchAchievement(@Param('gameId', ParseIntPipe) gameId: number) {
    const result = await this.achievementService.fetchAchievement(gameId);
    await this.achievementService.fetchCompletedRate(gameId);
    return result;
  }
  @Get('/:gameId')
  async fetchUserAchievement(
    @UserDeco('steamid') steamid: string,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.achievementService.getAllAchievementAboutUser(gameId, steamid);
  }
}
