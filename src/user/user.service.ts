import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { userInfo } from 'os';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.create();
  }

  async getUserInfo(steamid: string): Promise<any> {
    const apiKey = this.configService.get('STEAM_API_KEY');
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamid}`;

    const response = await lastValueFrom(this.httpService.get(url));
    console.log('getuserinfo', response.data);
    return response.data;
  }

  async getUserFromDb(steamid: string) {
    const user = await this.userRepository.find({
      where: { steamid },
      relations: { games: true },
    });
    return user[0];
  }
}
