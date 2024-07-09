import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { user: User } = context
      .switchToHttp()
      .getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const accessToken = request.cookies['jwt'];
    const refreshToken = request.cookies['refreshToken'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    let user: User | null = null;
    request.user = null;

    if (accessToken) {
      user = this.authService.verifyJwtToken(accessToken);
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
      this.authService.clearAllCookies(response);
      throw new UnauthorizedException('Invalid refresh token');
    }

    request.user = user;
    return true;
  }
}
