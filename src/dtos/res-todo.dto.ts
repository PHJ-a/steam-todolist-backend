import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '../entities/todo.entity';

export class ResTodoDto {
  @ApiProperty()
  readonly todoId: number;
  @ApiProperty()
  readonly start: Date;
  @ApiProperty()
  readonly end: Date | null;
  @ApiProperty()
  readonly isFinished: boolean;
  @ApiProperty()
  readonly achieveId: number;
  @ApiProperty()
  readonly achieveName: string;
  @ApiProperty()
  readonly gameId: number;
  @ApiProperty()
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
  @ApiProperty()
  readonly achieveDescription: string;
  @ApiProperty()
  readonly achieveTag: string;
  @ApiProperty()
  readonly achieveIcon: string;
  @ApiProperty()
  readonly completedRate: number;

  constructor(data: Todo) {
    super(data);
    this.achieveTag = data.achievement.name;
    this.achieveDescription = data.achievement.description;
    this.achieveIcon = data.isFinished
      ? data.achievement.icon
      : data.achievement.icon_gray;
    this.completedRate = data.achievement.completed_rate;
  }
}
