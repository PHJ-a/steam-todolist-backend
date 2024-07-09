import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as OpenID from 'openid';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refreshtoken.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly rootUrl: string = `http://${this.configService.get<string>('NEST_API_BASE_URL')}:${this.configService.get<string>('NEST_API_PORT')}`;
  private readonly returnUrl: string = `${this.rootUrl}/login/return`;
  private readonly accessSecret: string =
    this.configService.get<string>('JWT_ACCESS_SECRET');
  private readonly refreshSecret: string =
    this.configService.get<string>('JWT_REFRESH_SECRET');
  private readonly accessExpireTime: number = +this.configService.get<number>('ACCESS_EXPIRE_TIME');
  private readonly refreshExpireTime: number = +this.configService.get<number>('REFRESH_EXPIRE_TIME');

  async getSteamLoginUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      const relyingParty = new OpenID.RelyingParty(
        this.returnUrl,
        this.rootUrl,
        true,
        true,
        [],
      );

      relyingParty.authenticate(
        'https://steamcommunity.com/openid',
        false,
        (error, authUrl) => {
          if (error) {
            reject(error);
          } else if (!authUrl) {
            reject(new UnauthorizedException('Authentication failed'));
          } else {
            resolve(authUrl);
          }
        },
      );
    });
  }

  async verifySteamResponse(
    url: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return new Promise((resolve, reject) => {
      const relyingParty = new OpenID.RelyingParty(
        this.returnUrl,
        this.rootUrl,
        true,
        true,
        [],
      );

      relyingParty.verifyAssertion(url, async (error, result) => {
        if (error) {
          reject(error);
        } else if (!result || !result.authenticated) {
          reject(new UnauthorizedException('Authentication failed'));
        } else {
          const steamid = result.claimedIdentifier.split('/').pop();
          try {
            let user: User = await this.userService.getUserInfo(steamid);
            // Generate tokens
            const tokens = await this.generateTokens(user);
            resolve(tokens);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  private async generateTokens(user: User) {
    const payload = instanceToPlain(user);
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessExpireTime,
      secret: this.accessSecret,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.refreshExpireTime,
      secret: this.refreshSecret,
    });

    await this.refreshTokenRepository.delete({
      user: user
    });
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user: user,
      expires: new Date(Date.now() + this.refreshExpireTime),
    });
    refreshTokenEntity.user = user;

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  verifyJwtToken(token: string): User | null {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.accessSecret,
      });
      const { iat, exp, ...payload } = decoded;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('jwt verification failed');
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken, {
      secret: this.refreshSecret,
    });

    const existingToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, user: { steamid: decoded.steamid } },
      relations: ['user'],
    });

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newTokens = await this.generateTokens(existingToken.user);

    return newTokens;
  }

  responseWithTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      maxAge: this.accessExpireTime,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: this.refreshExpireTime,
    });

    res.cookie('isLoggedin', 'true', {
      secure: true,
      maxAge: this.accessExpireTime,
    });
  }

  clearAllCookies(res: Response): void {
    res.clearCookie('jwt', {
      httpOnly: true,
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    res.clearCookie('isLoggedin', {
      secure: true,
    });
  }
}
