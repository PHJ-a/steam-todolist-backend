import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  create(createUserDto: CreateUserDto) {
    return this.userRepository.create();
  }

  // Todo: 일단 DB를 검색하고 해당 유저의 정보가 없으면 steam api에 요청하기?
  async getUserInfo(steamid: string): Promise<any> {
    const apiKey = this.configService.get('STEAM_API_KEY');
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamid}`;

    const response = await axios.get(url);
    const playerData = response.data.response.players[0];
    return playerData;
  }

  async getUserFromDb(steamid: string) {
    const user = await this.userRepository.find({
      where: { steamid },
      relations: { games: true },
    });
    return user[0];
  }
}
