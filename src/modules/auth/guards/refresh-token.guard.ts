import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCookieService } from '../auth-cookie.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authCookieService: AuthCookieService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.authCookieService.getRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }
    request.refreshToken = refreshToken;
    return true;
  }
}
