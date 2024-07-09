import { Module } from '@nestjs/common';
import { TodoService } from '../services/todo.service';
import { TodoController } from '../controllers/todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from '../entities/todo.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from './game.module';
import { AchievementModule } from './achievement.module';

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
