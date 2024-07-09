import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Todo } from './todo.entity';
import { RefreshToken } from './refreshtoken.entity';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: '사용자의 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '76561198063484357',
    description: '사용자의 스팀 ID',
  })
  @Column({ unique: true })
  @Expose()
  steamid: string;

  @ApiProperty({ example: 'kaorao', description: '사용자의 스팀 닉네임' })
  @Column({ default: '' })
  @Expose()
  nickname: string;

  @ApiProperty({
    example:
      'https://avatars.steamstatic.com/ae726297f6ed109726287bc29e1a41fc914cd6b6_full.jpg',
    description: '사용자의 프로필 아바타에 대한 주소',
  })
  @Column()
  @Expose()
  avatarfull: string;

  @ManyToMany(() => Game, (game) => game.users)
  games: Game[];

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshtoken: RefreshToken;
}
