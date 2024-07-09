import { ApiProperty } from '@nestjs/swagger';
import { Achievement } from 'src/entities/achievement.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Todo } from './todo.entity';
import { User } from './user.entity';

@Entity('game')
export class Game {
  @ApiProperty({ example: 123123, description: '게임 아이디' })
  @PrimaryColumn()
  appid: number;

  @ApiProperty({ example: '게임 이름', description: '게임 이름' })
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
