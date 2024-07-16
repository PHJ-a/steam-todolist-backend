import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FetchAchieveDto } from '../dtos/req-achieve.dto';
import {
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ResAchieveFetchingDto } from '../dtos/res-achieve.dto';
import { UserDeco } from 'src/decorators/user.decorator';
import { ExceptionFilterRes } from 'src/dtos/res-exception.dto';

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
  @ApiResponse({ status: 200, type: ResAchieveFetchingDto })
  @ApiNotFoundResponse({
    type: ExceptionFilterRes,
    description: 'DB에 해당 리소스를 찾을 수 없음. 메세지에 자세한 사항 표시',
  })
  @ApiInternalServerErrorResponse({
    type: ExceptionFilterRes,
    description: 'DB 저장 실패',
  })
  @ApiServiceUnavailableResponse({
    type: ExceptionFilterRes,
    description: '서버가 스팀에 요청한 api가 실패',
  })
  @Get('/:gameId')
  async fetchUserAchievement(
    @UserDeco('steamid') steamid: string,
    @Param() param: FetchAchieveDto,
  ) {
    const { gameId } = param;
    try {
      const exist = await this.achievementService.checkAchieveExist(gameId);

      const achievements = await this.achievementService.fetchAchievesAndRate(
        gameId,
        steamid,
        !exist,
      );

      const data = { achievements, gameId };
      return plainToClass(ResAchieveFetchingDto, data);
    } catch (error) {
      if (error.status === 404) {
        return { achievements: [], gameId };
      }
    }
  }
}
