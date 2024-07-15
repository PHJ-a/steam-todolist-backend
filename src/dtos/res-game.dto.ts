import { ApiProperty } from '@nestjs/swagger';

export class ResGameDto {
  @ApiProperty()
  appid: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  playTime: number;

  constructor(data: any) {
    this.appid = data.appid;
    this.name = data.name;
    this.playTime = data.playtime_forever;
  }
}
