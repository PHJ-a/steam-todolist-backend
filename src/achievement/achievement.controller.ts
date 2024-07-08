import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';
import { FetchAchieveDto } from './dto/req-achieve.dto';

@Controller('achievement')
@UseGuards(AuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('/:gameId')
  async fetchUserAchievement(
    @UserDeco('steamid') steamid: string,
    @Param() param: FetchAchieveDto,
  ) {
    const { gameId } = param;

    const exist = await this.achievementService.checkAchieveExist(gameId);

    await this.achievementService.fetchAchievesAndRate(gameId, steamid, !exist);
    const achievements =
      await this.achievementService.getAllAchievementAboutUser(gameId, steamid);

    return { achievements, gameId };
  }
}
