import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('MYSQL_CONTAINER_NAME'),
  port: configService.get<number>('MYSQL_TCP_PORT'),
  database: configService.get<string>('MYSQL_DATABASE'),
  username: configService.get<string>('MYSQL_USER'),
  password: configService.get<string>('MYSQL_USER_PASSWORD'),
  autoLoadEntities: true,
  synchronize: true,
});
