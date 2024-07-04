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
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';

@Controller('todo')
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(
    @Body('id', ParseIntPipe) achievementId: number,
    @UserDeco('id') userId: number,
  ) {
    return this.todoService.create(achievementId, userId);
  }

  @Get()
  findUnfinished(@UserDeco('id') userId: number) {
    return this.todoService.findUnfinished(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) todoId: number) {
    return this.todoService.findOne(todoId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) todoId: number, @Body() updateTodoDto) {
    return this.todoService.update(todoId, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) todoId: number) {
    return this.todoService.remove(todoId);
  }
}
