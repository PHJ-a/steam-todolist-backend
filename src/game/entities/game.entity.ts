import { User } from "src/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @ManyToOne(type => User, user => user.games)
  user: User;
}
