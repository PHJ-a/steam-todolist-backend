import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { steamid: string }= context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const accessToken = request.cookies['jwt'];
    const refreshToken = request.cookies['refreshToken'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    let user: { steamid: string } | null = null;
    request.steamid = null;

    if (accessToken) {
      try {
        user = this.authService.verifyJwtToken(accessToken);
      } catch (error) {
        if (error.name !== 'TokenExpiredError') {
          throw new UnauthorizedException('Invalid access token');
        }
      }
    }

    // access token has expired
    if (!user && refreshToken) {
      const newTokens = await this.authService.refreshAccessToken(refreshToken);
      user = this.authService.verifyJwtToken(newTokens.accessToken);

      // Set new tokens as cookies
      this.authService.responseWithTokens(
        response,
        newTokens.accessToken,
        newTokens.refreshToken,
      );
    }

    if (!user) {
      response.clearCookie('isLogin');
      throw new UnauthorizedException('Invalid refresh token');
    }

    request.steamid = user.steamid;
    return true;
  }
}
