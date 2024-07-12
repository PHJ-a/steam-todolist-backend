import { Controller, Get, UseGuards } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { UserDeco } from 'src/decorators/user.decorator';
import { ResGameDto } from 'src/dtos/res-game.dto';

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
  @ApiResponse({ type: ResGameDto, status: 200 })
  @ApiServiceUnavailableResponse({ status: 503 })
  @Get()
  async getUserGame(@UserDeco() user: User) {
    await this.gameService.fetchGames(user);

    const games = await this.gameService.getUserGamesFromSteam(user.steamid);
    return games.map((game) => new ResGameDto(game));
  }
}
