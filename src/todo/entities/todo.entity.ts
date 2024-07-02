import { User } from "src/user/entities/user.entity";
import { Entity, ManyToOne } from "typeorm";

@Entity()
export class Todo {
  @ManyToOne(type => User, user => user.todos)
  user: User;
}
