import { ApiProperty } from '@nestjs/swagger';

export class ResGameDto {
  @ApiProperty()
  appid: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  palyTime: number;
  @ApiProperty()
  lastPlayedTime: Date;

  constructor(data: any) {
    this.appid = data.appid;
    this.name = data.name;
    this.palyTime = data.playtime_forever;
    this.lastPlayedTime = new Date(data.rtime_last_played * 1000);
  }
}
