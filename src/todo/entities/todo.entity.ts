import { User } from "src/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.todos)
  user: User;
}
