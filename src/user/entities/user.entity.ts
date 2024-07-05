import { Expose } from 'class-transformer';
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
  @Expose()
  steamid: string;

  @Column({ default: '' })
  @Expose()
  nickname: string;

  @Column()
  @Expose()
  avatarfull: string;

  @ManyToMany(() => Game, (game) => game.users)
  games: Game[];

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshtokens: RefreshToken[];
}
