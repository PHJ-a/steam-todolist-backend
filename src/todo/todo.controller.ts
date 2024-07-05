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
import { ResTodoDetailDto, ResTodoDto } from './dto/res-todo.dto';

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
    return { todoId: result.id };
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
    const result = await this.todoService.getTodos(userId, complete);
    return result.map((data) => new ResTodoDto(data));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) todoId: number,
    @UserDeco() user: User,
  ) {
    const result = await this.todoService.update(todoId, user);
    if (result === null) {
      return {
        msg: '해당 도전과제가 완료되지 않았습니다. 게임에서 완료되었는지 확인해주세요.',
      };
    }

    return { todoId: result.id };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) todoId: number) {
    await this.todoService.remove(todoId);
    return { todoId };
  }
}
