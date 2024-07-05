import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement]), AuthModule],
  exports: [AchievementService],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
