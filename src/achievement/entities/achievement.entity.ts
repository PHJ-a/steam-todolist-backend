import { User } from 'src/user/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @ManyToOne((type) => User, (user) => user.achievements)
  user: User;
}
