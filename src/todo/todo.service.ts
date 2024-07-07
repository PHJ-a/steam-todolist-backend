import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementService } from 'src/achievement/achievement.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly achievementService: AchievementService,
  ) {}
  async create(achievementId, userId: number) {
    const exist = await this.todoRepository.findOne({
      where: { achievement_id: achievementId, user_id: userId },
    });
    if (exist) {
      throw new BadRequestException('이미 todo를 진행중');
    }
    const queryAchievement =
      await this.achievementService.getAchievementById(achievementId);
    const obj = this.todoRepository.create({
      user_id: userId,
      achievement_id: achievementId,
      game_id: queryAchievement.game_id,
    });
    return await this.todoRepository.save(obj);
  }

  async getTodos(userId: number, complete: boolean) {
    let condition: FindOptionsWhere<Todo> = { user_id: userId };

    if (complete !== undefined) {
      condition = { ...condition, isFinished: complete };
    }
    const todoList = await this.todoRepository.find({
      where: condition,
      relations: { achievement: true, game: true },
    });
    return todoList;
  }

  async getTodoDetail(id: number) {
    const todo = await this.todoRepository.findOne({
      where: { id: id },
      relations: { achievement: true, game: true },
    });
    return todo;
  }

  async update(id: number, user: User) {
    const todo = await this.todoRepository.findOne({
      where: { id: id },
      relations: { achievement: true },
    });
    if (!todo) {
      throw new BadRequestException('없는 todo');
    }
    // db 도전과제 , 유저의 도전과제 상태 가져오기
    const [achievement, fetchingAchieve] = await Promise.all([
      this.achievementService.getAchievementById(todo.achievement_id),
      this.achievementService.getUserAchievementFromSteam(
        todo.achievement.game_id,
        user.steamid,
      ),
    ]);
    const newFetchingData = fetchingAchieve.filter(
      (data) => data.apiname === achievement.name,
    )[0];
    // 실제로 도전과제가 완료되지 않은 경우
    if (newFetchingData.achieved === 0) {
      return null;
    } else {
      // 실제로 완료됐으면 db에도 업데이트
      const updatedTodo = await this.todoRepository.save({
        ...todo,
        end: new Date(newFetchingData.unlocktime * 1000),
        isFinished: true,
      });
      return updatedTodo;
    }
  }

  async remove(id: number) {
    const todo = await this.todoRepository.findOne({ where: { id: id } });
    if (!todo) {
      throw new BadRequestException('없는 todo');
    }
    const removedTodo = await this.todoRepository.delete({ id: id });
    console.log(removedTodo);
    return removedTodo;
  }
}
