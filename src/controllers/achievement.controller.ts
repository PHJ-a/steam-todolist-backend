import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FetchAchieveDto } from '../dtos/req-achieve.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ResAchieveWithUserDto } from '../dtos/res-achieve.dto';
import { UserDeco } from 'src/decorators/user.decorator';

@ApiTags('Achievement')
@ApiCookieAuth('access-token')
@Controller('achievement')
@UseGuards(AuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @ApiOperation({
    summary: '도전과제 패칭',
    description:
      '도전과제와 달성률을 패칭하고 유저의 도전과제 정보를 가져옵니다.',
  })
  @ApiResponse({ status: 200, type: ResAchieveWithUserDto })
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

    const data = { achievements, gameId };
    return plainToClass(ResAchieveWithUserDto, data);
  }
}
