import { ApiProperty } from '@nestjs/swagger';
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
