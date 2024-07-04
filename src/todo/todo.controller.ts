import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ResTodoDetailDto } from './dto/res-todoDetail.dto';
import { ResTodoDto } from './dto/res-todo.dto';

@Controller('todo')
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  async create(
    @Body('id', ParseIntPipe) achievementId: number,
    @UserDeco('id') userId: number,
  ) {
    const result = await this.todoService.create(achievementId, userId);
    return new ResTodoDto(result);
  }

  @Get(':id')
  async getTodoDetail(@Param('id', ParseIntPipe) todoId: number) {
    const result = await this.todoService.getTodoDetail(todoId);
    return new ResTodoDetailDto(result);
  }

  @Get()
  async findUserTodo(
    @UserDeco('id') userId: number,
    @Query('complete') complete: boolean,
  ) {
    const result = await this.todoService.find(userId, complete);
    return result.map((data) => new ResTodoDto(data));
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) todoId: number, @UserDeco() user: User) {
    return this.todoService.update(todoId, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) todoId: number) {
    return this.todoService.remove(todoId);
  }
}
