import { Expose } from 'class-transformer';
import { Achievement } from 'src/achievement/entities/achievement.entity';
import { RefreshToken } from 'src/auth/entities/refreshtoken.entity';
import { Game } from 'src/game/entities/game.entity';
import { Todo } from 'src/todo/entities/todo.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  @Expose()
  steamid: string;

  @Column()
  @Expose()
  personaname: string;

  @OneToMany((type) => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToMany((type) => RefreshToken, (refreshToken) => refreshToken.user)
  refreshtokens: RefreshToken[];

  @OneToMany((type) => Game, (game) => game.user)
  games: Game[];

  @OneToMany((type) => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];
}
