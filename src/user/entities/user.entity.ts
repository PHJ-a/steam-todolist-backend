import { RefreshToken } from 'src/auth/entities/refreshtoken.entity';
import { Game } from 'src/game/entities/game.entity';
import { Todo } from 'src/todo/entities/todo.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  steamid: string;

  @Column()
  nickname: string;

  @ManyToMany(() => Game, (game) => game.users)
  games: Game[];

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshtokens: RefreshToken[];

  @OneToMany((type) => Game, (game) => game.user)
  games: Game[];

  @OneToMany((type) => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];
}
