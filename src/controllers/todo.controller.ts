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
import { TodoService } from '../services/todo.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ResTodoDetailDto, ResTodoDto } from '../dtos/res-todo.dto';
import { TodoBodyDto, TodoParamDto, TodoQueryDto } from '../dtos/req-todo.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { UserDeco } from 'src/decorators/user.decorator';
import { ExceptionFilterRes } from 'src/dtos/res-exception.dto';

@ApiTags('Todo')
@ApiCookieAuth('access-token')
@Controller('todo')
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @ApiOperation({ summary: 'Todo 만들기' })
  @ApiBody({ type: TodoBodyDto })
  @ApiResponse({ type: TodoBodyDto, status: 201 })
  @ApiResponse({
    type: ExceptionFilterRes,
    status: 400,
    description: '이미 해당 도전과제가 todo로 진행중',
  })
  @ApiInternalServerErrorResponse({
    type: ExceptionFilterRes,
    description: 'db 저장 실패',
  })
  @Post()
  async create(@Body() body: TodoBodyDto, @UserDeco('id') userId: number) {
    const { id: achievementId } = body;
    const result = await this.todoService.create(achievementId, userId);
    return { id: result.id };
  }

  @ApiOperation({ summary: 'Todo id로 특정 Todo 가져오기' })
  @ApiResponse({ status: 200, type: ResTodoDetailDto })
  @ApiNotFoundResponse({
    type: ExceptionFilterRes,
    description: '해당 todo가 없음.',
  })
  @Get(':id')
  async getTodoDetail(@Param() param: TodoParamDto) {
    const { id: todoId } = param;
    const result = await this.todoService.getTodoDetail(todoId);
    return new ResTodoDetailDto(result);
  }

  @ApiOperation({ summary: 'Todo 전부 가져오기' })
  @ApiResponse({
    type: [ResTodoDto],
    status: 200,
    description: '에러처리는 없고 todo없으면 빈 배열 반환',
  })
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
  @ApiNotFoundResponse({
    type: ExceptionFilterRes,
    description: '해당 todo가 없음.',
  })
  @ApiInternalServerErrorResponse({
    type: ExceptionFilterRes,
    description: 'db 저장 실패',
  })
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
  @ApiResponse({
    type: ExceptionFilterRes,
    status: 404,
    description: '해당 todo가 없음.',
  })
  @ApiResponse({
    type: ExceptionFilterRes,
    status: 500,
    description: 'db 저장 실패',
  })
  @Delete(':id')
  async remove(@Param() param: TodoParamDto) {
    const { id: todoId } = param;
    await this.todoService.remove(todoId);
    return { id: todoId };
  }
}
