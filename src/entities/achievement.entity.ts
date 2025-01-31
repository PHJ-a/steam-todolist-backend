import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Todo } from './todo.entity';

@Entity('achievement')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completed_rate: number;

  @Column()
  icon: string;

  @Column()
  icon_gray: string;

  @Column()
  game_id: number;

  @ManyToOne(() => Game, (game) => game.achievement)
  @JoinColumn({ name: 'game_id', referencedColumnName: 'appid' })
  game: Game;

  @OneToMany(() => Todo, (todo) => todo.achievement)
  todo: Todo[];
}
