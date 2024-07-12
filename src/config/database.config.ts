import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV');
  console.log('MYSQL_TCP_PORT', configService.get<number>('MYSQL_TCP_PORT'));

  return {
    type: 'mysql',
    host: configService.get<string>('MYSQL_CONTAINER_NAME'),
    port: configService.get<number>('MYSQL_TCP_PORT'),
    database: configService.get<string>('MYSQL_DATABASE'),
    username: configService.get<string>('MYSQL_USER'),
    password: configService.get<string>('MYSQL_USER_PASSWORD'),
    autoLoadEntities: true,
    synchronize: nodeEnv !== 'production',
  };
};
