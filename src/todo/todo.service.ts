import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateToDoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}
  async create(achievementId, userId: number) {
    const exist = await this.todoRepository.exists({
      where: { achievement: { id: achievementId }, user_id: userId },
    });
    if (exist) {
      throw new BadRequestException('이미 todo를 진행중');
    }

    const obj = this.todoRepository.create({
      user_id: userId,
      achievement_id: achievementId,
    });
    return await this.todoRepository.save(obj);
  }

  async findUnfinished(userId: number) {
    const todoList = await this.todoRepository.find({
      where: { user_id: userId, isFinished: false },
    });
    return todoList;
  }

  async findOne(id: number) {
    const todo = await this.todoRepository.findOne({ where: { id: id } });
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateToDoDto) {
    const todo = await this.todoRepository.findOne({ where: { id: id } });
    if (!todo) {
      throw new BadRequestException('없는 todo');
    }

    const updated = await this.todoRepository.save({
      ...todo,
      [updateTodoDto.type]: updateTodoDto.date,
      // end값 수정은 todo 완료이므로 isFinished true로 변경
      isFinished: updateTodoDto.type === 'end',
    });
    return updated;
  }

  async remove(id: number) {
    const todo = await this.todoRepository.findOne({ where: { id: id } });
    if (!todo) {
      throw new BadRequestException('없는 todo');
    }
    await this.todoRepository.delete({ id: id });
    return { msg: '삭제 완료', id };
  }
}
