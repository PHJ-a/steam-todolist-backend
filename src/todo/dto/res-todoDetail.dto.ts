import { Game } from 'src/game/entities/game.entity';
import { Todo } from '../entities/todo.entity';
export class ResTodoDetailDto {
  id: number;
  gameName: string;
  gameId: number;
  achieveId: number;
  achieveTag: string;
  achieveName: string;
  achieveDescription: string;
  achieveIcon: string;
  start: Date;
  completedRate: number;
  constructor(data: { game: Game; todo: Todo }) {
    this.id = data.todo.id;
    this.gameName = data.game.name;
    this.gameId = data.game.appid;
    this.achieveTag = data.todo.achievement.name;
    this.achieveName = data.todo.achievement.displayName;
    this.achieveDescription = data.todo.achievement.description;
    this.achieveIcon = data.todo.achievement.icon_gray;
    this.start = data.todo.start;
    this.achieveId = data.todo.achievement_id;
    this.completedRate = data.todo.achievement.completed_rate;
  }
}
