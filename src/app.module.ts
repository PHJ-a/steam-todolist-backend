import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TodoModule } from './todo/todo.module';
import { AchievementModule } from './achievement/achievement.module';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: parseInt(process.env.MYSQL_TCP_PORT),
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_USER_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
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
