import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('status')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async getStatus(@Req() req: Request & { user: User }) {
    const user = req.user;
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
