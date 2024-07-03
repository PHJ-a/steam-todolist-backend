import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserAchievementBridge } from './entities/achivement-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, UserAchievementBridge])],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
