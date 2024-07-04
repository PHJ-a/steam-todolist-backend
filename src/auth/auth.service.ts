import { Injectable } from '@nestjs/common';
import * as OpenID from 'openid';
import axios from 'axios';
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

  private readonly rootUrl = `http://${this.configService.get('NEST_API_BASE_URL')}:${this.configService.get('NEST_API_PORT')}`;
  private readonly returnUrl = `${this.rootUrl}/login/return`;
  private readonly steamApiKey = this.configService.get('STEAM_API_KEY');
  private readonly accessSecret = this.configService.get('JWT_ACCESS_SECRET');
  private readonly refreshSecret = this.configService.get('JWT_REFRESH_SECRET');

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
            reject(new Error('Authentication failed'));
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
          reject(new Error('Authentication failed'));
        } else {
          const steamid = result.claimedIdentifier.split('/').pop();
          try {
            // Get or create user in database
            // let user: User = await this.userService.getUserInfo(steamid);
            // if (!user) {
            let user = await this.userService.create({ steamid });
            // }
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
      expiresIn: '5s',
      secret: this.accessSecret,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1m',
      secret: this.refreshSecret,
    });

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user: user,
      expires: new Date(Date.now() + 60 * 1000), // 1 minute from now
    });
    // user should have id column
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  verifyJwtToken(token: string): User | null {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.accessSecret,
      });
      return decoded;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      const existingToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, user: { steamid: decoded.steamid } },
        relations: ['user'],
      });

      if (!existingToken) {
        throw new Error('Invalid refresh token');
      }

      const newTokens = await this.generateTokens(existingToken.user);
      await this.refreshTokenRepository.delete({ token: refreshToken });

      return newTokens;
    } catch (error) {
      console.error('Error refreshing access token:', error);
    }
  }

  responseWithTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      maxAge: 5000, // 5 seconds
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 1000, // 1 minute
    });

    res.cookie('isLoggedin', 'true', {
      secure: true,
      maxAge: 1000 * 60 * 15
    });
  }

  clearAllCookies(
    res: Response,
  ): void {
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
