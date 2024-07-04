import { Achievement } from 'src/achievement/entities/achievement.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  start: Date;

  @Column({ default: null })
  end: Date | null;

  @Column({ default: false })
  isFinished: boolean;

  @Column()
  user_id: number;

  @Column()
  achievement_id: number;

  @ManyToOne(() => Achievement, (achievement) => achievement.todo)
  @JoinColumn({ name: 'achievement_id', referencedColumnName: 'id' })
  achievement: Achievement;

  @ManyToOne(() => User, (user) => user.todos)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
