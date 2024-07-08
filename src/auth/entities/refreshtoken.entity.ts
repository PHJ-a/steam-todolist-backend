import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  token: string;

  @CreateDateColumn()
  createdAt: Date;
  
  @Column({ default: false })
  isRevoked: boolean;
  
  @Column({ type: 'timestamp' })
  expires: Date;

  @Column()
  user_id: number;

  @OneToOne(() => User, (user) => user.refreshtoken)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
