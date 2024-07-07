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
    const exist = await this.achievementService.checkAchieveExist(gameId);
    if (!exist) {
      await this.achievementService.initSaveAchievement(gameId);
    }

    const achievements =
      await this.achievementService.getAllAchievementAboutUser(gameId, steamid);

    return { achievements, gameId };
  }
}
