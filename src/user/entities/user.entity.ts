import { Todo } from "src/todo/entities/todo.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly steam_id: number;

  @Column()
  readonly nickname: string;

  @OneToMany(type => Todo, todo => todo.user)
  todos: Todo[];
}
