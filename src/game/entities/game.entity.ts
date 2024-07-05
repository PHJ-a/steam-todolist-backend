import { Achievement } from 'src/achievement/entities/achievement.entity';
import { Todo } from 'src/todo/entities/todo.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity('game')
export class Game {
  @PrimaryColumn()
  appid: number;

  @Column()
  name: string;

  @OneToMany(() => Achievement, (achievement) => achievement.game)
  achievement: Achievement[];

  @OneToMany(() => Todo, (todo) => todo.game)
  todos: Todo[];

  @ManyToMany(() => User, (user) => user.games, { nullable: false })
  @JoinTable({
    name: 'user_game',
    joinColumn: { name: 'appid', referencedColumnName: 'appid' },
    inverseJoinColumn: { name: 'steamid', referencedColumnName: 'steamid' },
  })
  users: User[];
}
