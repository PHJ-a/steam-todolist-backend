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

@Controller('game')
@UseGuards(AuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

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
