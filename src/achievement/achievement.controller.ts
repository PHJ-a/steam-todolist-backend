import {
  Controller,
  Get,
  InternalServerErrorException,
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

  @Get('/:gameId')
  async fetchUserAchievement(
    @UserDeco('steamid') steamid: string,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    const isFetching = await this.achievementService.fetchAchievement(gameId);
    await this.achievementService.fetchCompletedRate(gameId);
    if (isFetching) {
      return this.achievementService.getAllAchievementAboutUser(
        gameId,
        steamid,
      );
    } else {
      throw new InternalServerErrorException('도전과제 패칭 실패');
    }
  }
}
