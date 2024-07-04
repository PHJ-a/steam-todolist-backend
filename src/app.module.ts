import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TodoModule } from './todo/todo.module';
import { AchievementModule } from './achievement/achievement.module';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Game } from './game/entities/game.entity';
import { Achievement } from './achievement/entities/achievement.entity';
import { Todo } from './todo/entities/todo.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'SteamTodolist',
      entities: [User, Game, Achievement, Todo],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
    TodoModule,
    AchievementModule,
    GameModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
