import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['jwt'];
    const refreshToken = request.cookies['refreshToken'];

    if (!token && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    let user = null;
    request.steamid = null;

    if (token) {
      try {
        user = this.authService.verifyJwtToken(token);
      } catch (error) {
        if (error.name !== 'TokenExpiredError') {
          throw new UnauthorizedException('Invalid token');
        }
      }
    }

    // access token has expired
    if (!user && refreshToken) {
      const newTokens = await this.authService.refreshAccessToken(refreshToken);
      user = this.authService.verifyJwtToken(newTokens.accessToken);

      // Set new tokens as cookies
      request.res.cookie('jwt', newTokens.accessToken, {
        httpOnly: true,
        maxAge: 5000, // 5 seconds
      });

      request.res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.steamid = user.steamid;
    return true;
  }
}
