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

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('status')
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
