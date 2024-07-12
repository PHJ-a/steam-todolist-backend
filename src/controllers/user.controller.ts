import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '../entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDeco } from 'src/decorators/user.decorator';

@ApiTags('User')
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor() {}

  @Get('status')
  @ApiResponse({
    status: 200,
    description: '유저 정보를 성공적으로 찾았습니다',
    type: [User],
  })
  @ApiResponse({ status: 404, description: '유저 정보를 찾지 못했습니다' })
  async getStatus(@UserDeco() user: User) {
    if (!user) {
      throw new NotFoundException(`There isn't user you are searching`);
    }
    return user;
  }
}
