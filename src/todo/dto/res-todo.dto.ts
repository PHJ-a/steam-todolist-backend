import { Todo } from '../entities/todo.entity';

export class ResTodoDto {
  readonly todoId: number;
  readonly start: Date;
  readonly end: Date | null;
  readonly isFinished: boolean;
  readonly achieveId: number;
  readonly achieveName: string;
  readonly gameId: number;
  readonly gameName: string;
  constructor(data: Todo) {
    this.todoId = data.id;
    this.start = data.start;
    this.end = data.end;
    this.isFinished = data.isFinished;
    this.achieveId = data.achievement_id;
    this.achieveName = data.achievement.displayName;
    this.gameId = data.game_id;
    this.gameName = data.game.name;
  }
}

export class ResTodoDetailDto extends ResTodoDto {
  readonly achieveDescription: string;
  readonly achieveTag: string;
  readonly achieveIcon: string;
  readonly completedRate: number;

  constructor(data: Todo) {
    super(data);
    this.achieveTag = data.achievement.name;
    this.achieveDescription = data.achievement.description;
    this.achieveIcon = data.achievement.icon_gray;
    this.completedRate = data.achievement.completed_rate;
  }
}
