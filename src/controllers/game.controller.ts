import {
  Controller,
  Get,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { GameService } from '../services/game.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Game } from '../entities/game.entity';
import { User } from 'src/entities/user.entity';
import { UserDeco } from 'src/decorators/user.decorator';

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
