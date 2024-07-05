import { IsNumber, IsNumberString, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumberString()
  steamid: string;
}
