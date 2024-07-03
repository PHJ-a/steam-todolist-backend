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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly realm = 'http://localhost:3000';
  private readonly returnUrl = 'http://localhost:3000/login/return';
  private readonly steamApiKey = this.configService.get('STEAM_API_KEY');
  private readonly accessSecret = this.configService.get('JWT_ACCESS_SECRET');
  private readonly refreshSecret = this.configService.get('JWT_REFRESH_SECRET');

  async getSteamLoginUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      const relyingParty = new OpenID.RelyingParty(
        this.returnUrl,
        this.realm,
        true,
        true,
        []
      );

      relyingParty.authenticate('https://steamcommunity.com/openid', false, (error, authUrl) => {
        if (error) {
          reject(error);
        } else if (!authUrl) {
          reject(new Error('Authentication failed'));
        } else {
          resolve(authUrl);
        }
      });
    });
  }

  async verifySteamResponse(url: string): Promise<{ accessToken: string, refreshToken: string }> {
    return new Promise((resolve, reject) => {
      const relyingParty = new OpenID.RelyingParty(
        this.returnUrl,
        this.realm,
        true,
        true,
        []
      );
  
      relyingParty.verifyAssertion(url, async (error, result) => {
        if (error) {
          reject(error);
        } else if (!result || !result.authenticated) {
          reject(new Error('Authentication failed'));
        } else {
          const steamId = result.claimedIdentifier.split('/').pop();
          
          try {
            // Get or create user in database
            let user: User = await this.userRepository.findOne({
              where: {
                steamid: steamId,
              }
            });
            if (!user) {
              const userInfo = await this.getUserInfoFromSteam(steamId);
              user = this.userRepository.create(userInfo);
              await this.userRepository.save(userInfo);
            }
  
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
  

  async getUserInfoFromSteam(steamId: string): Promise<User> {
    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.steamApiKey}&steamids=${steamId}`;
    try {
      const response = await axios.get(url);
      if (response.data.response.players.length === 0) {
        throw new Error('No player data found');
      }
      return response.data.response.players[0];
    } catch (error) {
      console.error('Error fetching Steam user info:', error);
      throw error;
    }
  }

  async generateTokens(user: Partial<User>) {
    const payload = { steamid: user.steamid };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '5s', secret: this.accessSecret });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1m', secret: this.refreshSecret });

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user: user,
      expires: new Date(Date.now() + 60 * 1000)  // 1 minute from now
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  verifyJwtToken(token: string): { steamid: string } | null {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.accessSecret
      });
      return decoded
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, { secret: this.refreshSecret });

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

  responseWithTokens(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      maxAge: 5000, // 5 seconds
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 1000 // 1 minute
    });
  }
}