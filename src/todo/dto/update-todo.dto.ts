import { IsDate } from 'class-validator';
import { Todo } from '../entities/todo.entity';

export class UpdateToDoDto {
  type: keyof Pick<Todo, 'start' | 'end'>;

  @IsDate()
  date: Date;
}
