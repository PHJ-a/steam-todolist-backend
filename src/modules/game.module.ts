import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { GameService } from 'src/services/game.service';
import { GameController } from 'src/controllers/game.controller';
import { Game } from 'src/entities/game.entity';
import { UserModule } from './user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), AuthModule, UserModule],
  exports: [GameService],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}