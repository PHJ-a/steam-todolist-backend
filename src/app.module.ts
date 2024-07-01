import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TodoModule } from './todo/todo.module';
import { AchievementModule } from './achievement/achievement.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [UserModule, TodoModule, AchievementModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
