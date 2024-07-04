import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async getUserGame() {
    const steamid = process.env.STEAM_ID;
    const games = await this.gameService.findOwnedGame(steamid);
    return games;
  }

  @Get('fetch')
  async fetchGames() {
    const steamid = process.env.STEAM_ID;
    const games = await this.gameService.fetchGames(steamid);
    return games;
  }
}
