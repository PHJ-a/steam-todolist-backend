import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { AchievementModule } from 'src/achievement/achievement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    AuthModule,
    GameModule,
    AchievementModule,
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
