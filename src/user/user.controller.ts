import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  getUserInfo(@Query('userId') userId: string) {
    return this.userService.getUserInfo(userId);
  }


  @Get('status')
  @UseGuards(AuthGuard)
  async getStatus(@Req() req: Request & { steamid: string }) {
    const steamid = req.steamid
    if (!steamid) {
      return { loggedIn: false };
    }
    const user = await this.userService.getUserInfo(steamid);
    return { loggedIn: true, user: user };
  }
}
