import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { AuthRequestMeta } from './interface/auth-meta.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AuthMessageResponseDto,
  AuthTokenResponseDto,
  AuthUserResponseDto,
} from './dto/auth-response.dto';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthJwtPayload } from './token.service';
import { GetAuthMeta } from 'src/common/decorators/auth/auth-meta.decorator';
import { AuthCookieService } from './auth-cookie.service';
import { AuthMapper } from './auth.mapper';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Auth (Quản lý đăng nhập và đăng ký)')
@Controller('auth')
@ApiStandardError(undefined, '/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
    private readonly authMapper: AuthMapper,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiStandardSuccess(AuthTokenResponseDto)
  async register(
    @Body() registerDto: RegisterDto,
    @GetAuthMeta() meta: AuthRequestMeta,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.register(registerDto, meta);
    this.authCookieService.setAuthCookies(response, session);
    return this.authMapper.toSessionResponse(session);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiStandardSuccess(AuthTokenResponseDto)
  async login(
    @Body() loginDto: LoginDto,
    @GetAuthMeta() meta: AuthRequestMeta,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(loginDto, meta);
    this.authCookieService.setAuthCookies(response, session);
    return this.authMapper.toSessionResponse(session);
  }

  @Post('refresh')
  @Public()
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiStandardSuccess(AuthTokenResponseDto)
  async refresh(
    @Req() request: any,
    @GetAuthMeta() meta: AuthRequestMeta,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.refresh(request.refreshToken, meta);
    this.authCookieService.setAuthCookies(response, session);
    return this.authMapper.toSessionResponse(session);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất phiên hiện tại' })
  @ApiStandardSuccess(AuthMessageResponseDto)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(
      this.authCookieService.getRefreshToken(request),
    );
    this.authCookieService.clearAuthCookies(response);
    return this.authMapper.toMessageResponse(result);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiStandardSuccess(AuthUserResponseDto)
  async me(@CurrentUser() user: AuthJwtPayload) {
    const result = await this.authService.me(user);
    return this.authMapper.toUserResponse(result);
  }

  @Patch('me/password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu người dùng hiện tại' })
  @ApiStandardSuccess(AuthMessageResponseDto)
  async changePassword(
    @CurrentUser() user: AuthJwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.changePassword(
      user,
      changePasswordDto,
    );
    this.authCookieService.clearAuthCookies(response);
    return this.authMapper.toMessageResponse(result);
  }
}
