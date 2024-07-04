import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private readonly returnUrl = `http://${this.configService.get('NEST_API_BASE_URL')}:${this.configService.get('NEST_API_PORT')}`;

  @Get('login')
  async steamLogin(@Req() req: Request, @Res() res: Response) {
    const steamLoginUrl = await this.authService.getSteamLoginUrl();
    const referer = req.headers.referer;
    const origin = referer ? new URL(referer).origin : this.returnUrl;

    res.cookie('returnTo', origin, { httpOnly: true });

    res.redirect(steamLoginUrl);
  }

  @Get('login/return')
  async steamReturn(@Req() req: Request, @Res() res: Response) {
    try {
      const tokens = await this.authService.verifySteamResponse(req.url);
      const { accessToken, refreshToken } = tokens;

      this.authService.responseWithTokens(res, accessToken, refreshToken);

      const returnTo = req.cookies.returnTo || this.returnUrl;
      res.clearCookie('returnTo');
      res.redirect(returnTo);
    } catch (error) {
      console.error('Steam authentication error:', error);
      res.status(400).json({ error: 'Authentication failed' });
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    this.authService.clearAllCookies(res);
    res.json({ success: true });
  }
}
