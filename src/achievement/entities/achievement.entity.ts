import { Game } from 'src/game/entities/game.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('achievement')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  displayName: string;

  @Column()
  description: string;

  @Column()
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

  @ManyToMany(() => User, (user) => user.achievement)
  @JoinTable({
    name: 'user_achievement',
    joinColumn: { name: 'achievement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
