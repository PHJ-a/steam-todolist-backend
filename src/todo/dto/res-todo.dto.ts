import { Todo } from '../entities/todo.entity';

export class ResTodoDto {
  id: number;
  start: Date;
  end: Date | null;
  isFinished: boolean;
  userId: number;
  achievementId: number;
  constructor(data: Todo) {
    this.id = data.id;
    this.start = data.start;
    this.end = data.end;
    this.isFinished = data.isFinished;
    this.userId = data.user_id;
    this.achievementId = data.achievement_id;
  }
}
