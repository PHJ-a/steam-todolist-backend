import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './modules/user.module';
import { TodoModule } from './modules/todo.module';
import { AchievementModule } from './modules/achievement.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { GameModule } from './modules/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    UserModule,
    TodoModule,
    AchievementModule,
    GameModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
