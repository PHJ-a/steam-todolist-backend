import { Module } from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { AchievementController } from '../controllers/achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../entities/achievement.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from './game.module';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement]), AuthModule, GameModule],
  exports: [AchievementService],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
