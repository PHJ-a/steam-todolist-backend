import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Game } from '../entities/game.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly configService: ConfigService,
  ) {}

  /** db와 steam 게임 데이터 동기화 */
  async fetchGames(user: User) {
    const gamesFromSteam = await this.getUserGamesFromSteam(user.steamid);

    /** db에 저장된 게임 목록 */
    const dbGames = await this.gameRepository.find({});

    // db에 저장된 게임 없는 경우
    if (dbGames.length === 0) {
      const willSaved: Game[] = [];
      for (const gameFromSteam of gamesFromSteam) {
        const newGame = new Game();
        newGame.appid = gameFromSteam.appid;
        newGame.name = gameFromSteam.name;
        willSaved.push(newGame);
      }
      try {
        await this.gameRepository.save(willSaved);
      } catch (error) {
        throw new InternalServerErrorException('DB에 게임 저장 실패');
      }
    } else {
      // db에 없는 게임만 db에 저장

      const dbGameMap = new Map<number, Game>();
      for (const dbGame of dbGames) {
        dbGameMap.set(dbGame.appid, dbGame);
      }

      /** db에 없는 게임 */
      const notExistDbGames: Game[] = [];

      for (const gameFromSteam of gamesFromSteam) {
        const dbGame: Game = dbGameMap.get(gameFromSteam.appid);

        // db에 게임이 존재하지 않는 경우
        if (!dbGame) {
          const newGame = new Game();
          newGame.appid = gameFromSteam.appid;
          newGame.name = gameFromSteam.name;

          notExistDbGames.push(newGame);
        }
      }
      try {
        if (notExistDbGames.length > 0) {
          await this.gameRepository.insert(notExistDbGames);
        }
      } catch (error) {
        throw new InternalServerErrorException('DB에 게임 업데이트 실패');
      }
    }
    return gamesFromSteam;
  }

  async findGameById(gameId: number) {
    const game = await this.gameRepository.findOne({
      where: { appid: gameId },
    });
    if (!game) {
      throw new NotFoundException('해당 게임은 DB에 없습니다.');
    }
    return game;
  }
  //-------------------- Steam api -----------------

  async getUserGamesFromSteam(steamid: string) {
    try {
      const steamApiKey = this.configService.get<string>('STEAM_API_KEY');
      const { data } = await axios.get(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamid}&include_appinfo=1`,
      );
      /** 스팀에서 가져온 해당 유저가 보유한 게임 목록 */
      const gamesFromSteam = data.response.games;
      return gamesFromSteam;
    } catch (error) {
      throw new ServiceUnavailableException(
        '유저 소유 게임 리스트 스팀 api 실패',
      );
    }
  }
}
