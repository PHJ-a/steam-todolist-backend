import { RefreshToken } from "src/auth/entities/refreshtoken.entity";
import { Todo } from "src/todo/entities/todo.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  steamid: string;

  @Column()
  communityvisibilitystate: number;

  @Column()
  profilestate: number;

  @Column()
  personaname: string;
  
  @Column()
  profileurl: string;
  
  @Column()
  avatar: string;
  
  @Column()
  avatarmedium: string;
  
  @Column()
  avatarfull: string;
  
  @Column()
  avatarhash: string;
  
  @Column()
  lastlogoff: number;
  
  @Column()
  personastate: number;
  
  @Column()
  realname: string;
  
  @Column()
  primaryclanid: string;
  
  @Column()
  timecreated: number;
  
  @Column()
  personastateflags: number;

  @OneToMany(type => Todo, todo => todo.user)
  todos: Todo[];

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.user)
  refreshtokens: RefreshToken[];
}
