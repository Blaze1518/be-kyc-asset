import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthMapper } from './auth.mapper';

jest.mock('./auth.service', () => ({
  AuthService: class AuthService {},
}));

jest.mock('./auth-cookie.service', () => ({
  AuthCookieService: class AuthCookieService {},
}));

jest.mock('./auth.mapper', () => ({
  AuthMapper: class AuthMapper {},
}));

jest.mock('./guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {},
}));

jest.mock(
  'src/common/decorators/auth/auth-meta.decorator',
  () => ({
    GetAuthMeta: () => () => undefined,
  }),
  { virtual: true },
);

jest.mock(
  'src/modules/users/dto/response-user.dto',
  () => ({
    UserRoleResponseDto: class UserRoleResponseDto {},
  }),
  { virtual: true },
);

jest.mock(
  'src/common/decorators/swagger/errors.decorator',
  () => ({
    ApiStandardError: () => () => undefined,
  }),
  { virtual: true },
);

jest.mock(
  'src/common/decorators/swagger/success.decorator',
  () => ({
    ApiStandardSuccess: () => () => undefined,
  }),
  { virtual: true },
);

describe('AuthController', () => {
  let controller: AuthController;
  const response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
  const request = {
    cookies: {
      refresh_token: 'refresh-token',
    },
  };
  const session = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 900,
    message: 'Đăng nhập thành công',
    user: {
      id: 'user-id',
      username: 'admin_pro',
      displayName: 'Admin Pro',
      roles: [],
    },
  };
  const sessionResponse = {
    expiresIn: 900,
    message: session.message,
    user: session.user,
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockAuthCookieService = {
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
    getRefreshToken: jest.fn(),
  };

  const mockAuthMapper = {
    toSessionResponse: jest.fn(),
    toMessageResponse: jest.fn(),
    toUserResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthCookieService,
          useValue: mockAuthCookieService,
        },
        {
          provide: AuthMapper,
          useValue: mockAuthMapper,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sets cookies and returns safe response on register', async () => {
    mockAuthService.register.mockResolvedValue(session);
    mockAuthMapper.toSessionResponse.mockReturnValue(sessionResponse);

    await expect(
      controller.register(
        {
          username: 'admin_pro',
          displayName: 'Admin Pro',
          password: 'Password@123',
        },
        {},
        response as any,
      ),
    ).resolves.toBe(sessionResponse);

    expect(mockAuthCookieService.setAuthCookies).toHaveBeenCalledWith(
      response,
      session,
    );
    expect(mockAuthMapper.toSessionResponse).toHaveBeenCalledWith(session);
  });

  it('sets cookies and returns safe response on login', async () => {
    mockAuthService.login.mockResolvedValue(session);
    mockAuthMapper.toSessionResponse.mockReturnValue(sessionResponse);

    await expect(
      controller.login(
        {
          username: 'admin_pro',
          password: 'Password@123',
        },
        {},
        response as any,
      ),
    ).resolves.toBe(sessionResponse);

    expect(mockAuthCookieService.setAuthCookies).toHaveBeenCalledWith(
      response,
      session,
    );
  });

  it('reads refresh token from cookie and rotates cookies on refresh', async () => {
    mockAuthCookieService.getRefreshToken.mockReturnValue('refresh-token');
    mockAuthService.refresh.mockResolvedValue(session);
    mockAuthMapper.toSessionResponse.mockReturnValue(sessionResponse);

    await expect(
      controller.refresh(request as any, {}, response as any),
    ).resolves.toBe(sessionResponse);

    expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh-token', {});
    expect(mockAuthCookieService.setAuthCookies).toHaveBeenCalledWith(
      response,
      session,
    );
  });

  it('reads refresh token from cookie and clears cookies on logout', async () => {
    const message = { message: 'Đăng xuất thành công' };
    mockAuthCookieService.getRefreshToken.mockReturnValue('refresh-token');
    mockAuthService.logout.mockResolvedValue(message);
    mockAuthMapper.toMessageResponse.mockReturnValue(message);

    await expect(
      controller.logout(request as any, response as any),
    ).resolves.toBe(message);

    expect(mockAuthService.logout).toHaveBeenCalledWith('refresh-token');
    expect(mockAuthCookieService.clearAuthCookies).toHaveBeenCalledWith(
      response,
    );
  });
});
