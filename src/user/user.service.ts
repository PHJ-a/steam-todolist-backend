import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { steamid } = createUserDto
    const userInfo = await this.getUserInfo(steamid);
    const user = this.userRepository.create(userInfo);
    await this.userRepository.save(user);
    return user;
  }

  async getUserInfo(steamid: string): Promise<User> {
    // Todo: 일단 DB를 검색하고 해당 유저의 정보가 없으면 steam api에 요청하기?
    const userFromSteam = await this.getUserInfoFromSteam(steamid);
    const user: User = plainToInstance(User, userFromSteam, {
      excludeExtraneousValues: true,
    });
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
    }
  }

  async getUserFromDb(steamid: string) {
    const user = await this.userRepository.find({
      where: { steamid },
      relations: { games: true },
    });
    return user[0];
  }
}
