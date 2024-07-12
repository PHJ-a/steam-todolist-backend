import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private readonly returnUrl = `https://${this.configService.get<string>('NEST_API_BASE_URL')}`;
  private frontendPort = this.configService.get<number>('FRONT_END_PORT', 5173);
  private frontHost = this.configService.get<string>(
    'FRONT_END_BASE_URL',
    'localhost',
  );
  @Get('login')
  @ApiResponse({
    status: 302,
    description: '성공적으로 스팀 로그인 URL을 찾아서 리다이렉트 합니다',
  })
  async steamLogin(@Req() req: Request, @Res() res: Response) {
    const steamLoginUrl = await this.authService.getSteamLoginUrl();

    res.redirect(steamLoginUrl);
  }

  @Get('login/return')
  @ApiResponse({
    status: 304,
    description: 'Steam OpenID 인증이 성공하여 로그인 이전 페이지로 돌아갑니다',
  })
  @ApiResponse({
    status: 401,
    description:
      'Steam OpenID 인증 과정에서 오류가 발생하여 인증이 실패했습니다',
  })
  async steamReturn(@Req() req: Request, @Res() res: Response) {
    try {
      const tokens = await this.authService.verifySteamResponse(req.url);
      const { accessToken, refreshToken } = tokens;

      this.authService.responseWithTokens(res, accessToken, refreshToken);

      // res.clearCookie('returnTo');
      console.log(`Redirect to ${this.frontHost}`);
      res.redirect(`https://${this.frontHost}`);
    } catch (error) {
      console.error('login/return error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  @Get('logout')
  @ApiResponse({
    status: 200,
    description: '모든 쿠키가 삭제되어 성공적으로 로그아웃 되었습니다',
  })
  async logout(@Res() res: Response) {
    this.authService.clearAllCookies(res);
    res.json({ success: true });
  }
}
