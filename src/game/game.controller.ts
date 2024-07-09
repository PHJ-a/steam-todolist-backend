import {
  Controller,
  Get,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Game } from './entities/game.entity';

@ApiTags('Game')
@ApiCookieAuth('jwt')
@Controller('game')
@UseGuards(AuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({
    summary: '유저가 보유한 게임 패칭',
    description: '유저가 보유한 게임 목록을 가져옵니다.',
  })
  @ApiResponse({ type: Game, status: 200 })
  @ApiServiceUnavailableResponse({ status: 503 })
  @Get()
  async getUserGame(@UserDeco() user: User) {
    const isFetchFinished = await this.gameService.fetchGames(user);
    if (isFetchFinished) {
      const games = await this.gameService.findOwnedGame(user.steamid);
      return games;
    } else {
      throw new InternalServerErrorException('게임 패칭 실패');
    }
  }
}
