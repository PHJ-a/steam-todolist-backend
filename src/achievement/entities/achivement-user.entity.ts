import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Achievement } from './achievement.entity';

@Entity('user_achievement')
export class UserAchievementBridge {
  @Column()
  start: Date;

  @Column()
  end: Date;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  achievement_id: number;

  @ManyToOne(() => User, (user) => user.bridge)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'steamid' })
  user: User;

  @ManyToOne(() => Achievement, (achievement) => achievement.bridge)
  @JoinColumn({ name: 'achievement_id', referencedColumnName: 'id' })
  achievement: Achievement[];
}
