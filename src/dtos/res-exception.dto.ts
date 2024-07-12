import { ApiProperty } from '@nestjs/swagger';

export class ExceptionFilterRes {
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  path: string;
}
