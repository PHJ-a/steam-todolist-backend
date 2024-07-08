import {
  Controller,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';
import { UserDeco } from 'src/auth/decorator/user.decorator';
import { ApiResponse } from '@nestjs/swagger';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('status')
  @ApiResponse({ status: 200, description: '유저 정보를 성공적으로 찾았습니다', type: [User] })
  @ApiResponse({ status: 404, description: '유저 정보를 찾지 못했습니다' })
  async getStatus(@UserDeco() user: User) {
    if (!user) {
      throw new NotFoundException(`There isn't user you are searching`);
    }
    return user;
  }

  @Get('user')
  async getUser() {
    const steamid = process.env.STEAM_ID;
    const user = await this.userService.getUserFromDb(steamid);
    return user;
  }
}
