import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  async steamLogin(@Req() req: Request, @Res() res: Response) {
    const steamLoginUrl = await this.authService.getSteamLoginUrl();
    res.cookie('returnTo', req.query.returnTo || '/', { httpOnly: true });
    res.redirect(steamLoginUrl);
  }

  @Get('login/return')
  async steamReturn(@Req() req: Request, @Res() res: Response) {
    try {
      const tokens = await this.authService.verifySteamResponse(req.url);
      const { accessToken, refreshToken } = tokens;

      this.authService.responseWithTokens(res, accessToken, refreshToken);

      const returnTo = req.cookies.returnTo || '/';
      res.clearCookie('returnTo');
      res.redirect(returnTo);
    } catch (error) {
      console.error('Steam authentication error:', error);
      res.status(400).json({ error: 'Authentication failed' });
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    res.clearCookie('refreshToken');
    res.clearCookie('isLogin');
    res.json({ success: true });
  }
}
