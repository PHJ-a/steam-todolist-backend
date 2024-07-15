import { ApiProperty } from '@nestjs/swagger';

export class ResGameDto {
  @ApiProperty()
  appid: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  playTime: number;
  @ApiProperty()
  lastPlayedTime: Date | null;

  constructor(data: any) {
    this.appid = data.appid;
    this.name = data.name;
    this.playTime = data.playtime_forever;
    this.lastPlayedTime =
      data.rtime_last_played === 0
        ? null
        : new Date(data.rtime_last_played * 1000);
  }
}
