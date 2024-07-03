import { IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  steam_id: number;

  @IsString()
  nickname: string;
}
