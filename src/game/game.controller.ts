import { Controller, Get, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';

@Controller('game')
@UseGuards(AuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async getUserGame(@UserDeco('steamid') steamid: string) {
    const games = await this.gameService.findOwnedGame(steamid);
    return games;
  }

  @Get('fetch')
  async fetchGames(@UserDeco('steamid') steamid: string) {
    const games = await this.gameService.fetchGames(steamid);
    return games;
  }
}
