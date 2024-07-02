import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TodoModule } from './todo/todo.module';
import { AchievementModule } from './achievement/achievement.module';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './todo/entities/todo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_CONTAINER_NAME,
      port: parseInt(process.env.MYSQL_TCP_PORT),
      database: process.env.MYSQL_DATABASE,
      entities: [Todo],

      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_USER_PASSWORD,
      synchronize: true,
    }),
    UserModule,
    TodoModule,
    AchievementModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
