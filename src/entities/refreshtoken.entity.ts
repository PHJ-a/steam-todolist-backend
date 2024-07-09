import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class RefreshToken {
  @ApiProperty({ example: 1, description: '리프레시 토큰 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '리프레시 토큰 string literal' })
  @Column('text')
  token: string;

  @ApiProperty({
    example: Date.now(),
    description: '리프레시 토큰이 생성된 시간',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: Date.now() + 3600000,
    description: '리프레시 토큰이 만료되는 시간',
  })
  @Column({ type: 'timestamp' })
  expires: Date;

  @ApiProperty({ example: 1, description: '리프레시 토큰에 연결된 유저의 ID' })
  @Column()
  user_id: number;

  @OneToOne(() => User, (user) => user.refreshtoken)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
