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
    const response = context.switchToHttp().getResponse();
    const token = request.cookies['jwt'];
    const refreshToken = request.cookies['refreshToken'];

    if (!token && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    let user: { steamid: string } | null = null;
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
      this.authService.responseWithTokens(
        response,
        newTokens.accessToken,
        newTokens.refreshToken,
      );
    }

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.steamid = user.steamid;
    return true;
  }
}
