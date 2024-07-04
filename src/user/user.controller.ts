import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async getStatus(@Req() req: Request & { user: User }) {
    const user = req.user;
    if (!user) {
      return { loggedIn: false };
    }
    return { loggedIn: true, user: user };
  }
}
