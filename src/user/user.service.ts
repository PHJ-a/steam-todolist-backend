import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getUserInfo(steamid: string): Promise<User> {
    /** db에 있으면 바로 반환 */
    const userFromDb = await this.getUserFromDb(steamid);
    if (userFromDb) return userFromDb;

    /** db에 없으면 Steam에서 받아와서 DB에 저장 후 반환 */
    const userFromSteam = await this.getUserInfoFromSteam(steamid);
    const user: User = this.userRepository.create(userFromSteam);
    await this.userRepository.save(user);

    return user;
  }

  private async getUserInfoFromSteam(steamid: string): Promise<User> {
    const steamApiKey = this.configService.get('STEAM_API_KEY');
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamid}`;
    const response = await axios.get(url);
    if (response.data.response.players.length === 0) {
      throw new NotFoundException('No player data found');
    }
    const player = response.data.response.players[0];
    return {
      ...player,
      nickname: player.personaname,
    };
  }

  async getUserFromDb(steamid: string) {
    const user = await this.userRepository.findOne({
      where: { steamid },
      relations: { games: true },
    });
    return user;
  }
}
