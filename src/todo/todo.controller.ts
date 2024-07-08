import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserDeco } from 'src/auth/decorator/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ResTodoDetailDto, ResTodoDto } from './dto/res-todo.dto';
import { TodoBodyDto, TodoParamDto, TodoQueryDto } from './dto/req-todo.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Todo')
@ApiCookieAuth('access-token')
@Controller('todo')
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @ApiOperation({ summary: 'Todo 만들기' })
  @ApiBody({ type: TodoBodyDto })
  @ApiResponse({ type: TodoBodyDto, status: 201 })
  @Post()
  async create(@Body() body: TodoBodyDto, @UserDeco('id') userId: number) {
    const { id: achievementId } = body;
    const result = await this.todoService.create(achievementId, userId);
    return { id: result.id };
  }

  @ApiOperation({ summary: 'Todo id로 특정 Todo 가져오기' })
  @ApiResponse({ status: 200, type: ResTodoDetailDto })
  @Get(':id')
  async getTodoDetail(@Param() param: TodoParamDto) {
    const { id: todoId } = param;
    const result = await this.todoService.getTodoDetail(todoId);
    return new ResTodoDetailDto(result);
  }

  @ApiOperation({ summary: 'Todo 전부 가져오기' })
  @ApiResponse({ type: [ResTodoDto], status: 200 })
  @Get()
  async findUserTodo(
    @UserDeco('id') userId: number,
    @Query() query: TodoQueryDto,
  ) {
    const { complete } = query;
    const result = await this.todoService.getTodos(userId, complete);
    return result.map((data) => new ResTodoDto(data));
  }

  @ApiOperation({ summary: 'Todo 완료하기' })
  @ApiResponse({ type: TodoBodyDto, status: 200 })
  @Patch(':id')
  async update(@Param() param: TodoParamDto, @UserDeco() user: User) {
    const { id: todoId } = param;
    const result = await this.todoService.update(todoId, user);
    if (result === null) {
      return {
        msg: '해당 도전과제가 완료되지 않았습니다. 게임에서 완료되었는지 확인해주세요.',
      };
    }

    return { id: result.id };
  }

  @ApiOperation({ summary: 'Todo 삭제하기' })
  @ApiResponse({ type: TodoBodyDto, status: 200 })
  @Delete(':id')
  async remove(@Param() param: TodoParamDto) {
    const { id: todoId } = param;
    await this.todoService.remove(todoId);
    return { id: todoId };
  }
}
