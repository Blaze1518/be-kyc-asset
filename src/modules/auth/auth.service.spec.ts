import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PasswordHasher } from 'src/modules/users/password-hasher.service';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';

jest.mock(
  'src/common/database/abstract/transaction-manager.abstract',
  () => ({
    TransactionManager: class TransactionManager {},
  }),
  { virtual: true },
);

jest.mock('src/modules/users/repositories/users.repository', () => ({
  UsersRepository: class UsersRepository {},
}), { virtual: true });

jest.mock('src/modules/users/users.service', () => ({
  UsersService: class UsersService {},
}), { virtual: true });

jest.mock('../users/users.service', () => ({
  UsersService: class UsersService {},
}));

jest.mock('src/modules/users/password-hasher.service', () => ({
  PasswordHasher: class PasswordHasher {},
}), { virtual: true });

jest.mock('./token.service', () => ({
  TokenService: class TokenService {},
}));

jest.mock('./repositories/refresh-tokens.repository', () => ({
  RefreshTokensRepository: class RefreshTokensRepository {},
}));

describe('AuthService', () => {
  let service: AuthService;
  const txCtx = { tx: true };
  const now = new Date('2026-05-03T00:00:00.000Z');

  const user = {
    id: 'user-id',
    username: 'admin_pro',
    displayName: 'Admin Pro',
    hashed_password: 'hashed-password',
    token_version: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    roles: [
      {
        user_id: 'user-id',
        role_id: 'role-id',
        assignedAt: now,
        role: {
          id: 'role-id',
          name: 'Admin',
          description: null,
        },
      },
    ],
  };

  const meta = {
    ipAddress: '::ffff:127.0.0.1',
    userAgent: 'jest',
    deviceId: 'device-id',
    deviceName: 'Chrome',
  };

  const mockTransactionManager = {
    run: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  const mockUsersRepository = {
    findByUsernameWithRoles: jest.fn(),
    findByIdWithRoles: jest.fn(),
    update: jest.fn(),
  };

  const mockRefreshTokensRepository = {
    create: jest.fn(),
    findByHash: jest.fn(),
    revokeByHash: jest.fn(),
    revokeFamily: jest.fn(),
    revokeAllForUser: jest.fn(),
  };

  const mockPasswordHasher = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const mockTokenService = {
    generateTokenPair: jest.fn(),
    hashRefreshToken: jest.fn(),
    getAccessTokenExpiresInSeconds: jest.fn(),
    getRefreshTokenExpiresAt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TransactionManager,
          useValue: mockTransactionManager,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RefreshTokensRepository,
          useValue: mockRefreshTokensRepository,
        },
        {
          provide: PasswordHasher,
          useValue: mockPasswordHasher,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers user and persists refresh token in the same transaction', async () => {
    mockTransactionManager.run.mockImplementation((work) => work(txCtx));
    mockUsersService.create.mockResolvedValue(user);
    mockTokenService.generateTokenPair.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenFamily: 'token-family',
    });
    mockTokenService.hashRefreshToken.mockReturnValue('refresh-token-hash');
    mockTokenService.getRefreshTokenExpiresAt.mockReturnValue(now);
    mockTokenService.getAccessTokenExpiresInSeconds.mockReturnValue(900);

    const result = await service.register(
      {
        username: user.username,
        displayName: user.displayName,
        password: 'Password@123',
        deviceId: 'body-device',
      },
      meta,
    );

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user).toBe(user);
    expect(mockUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: user.username }),
      txCtx,
    );
    expect(mockRefreshTokensRepository.create).toHaveBeenCalledWith(
      {
        data: {
          user_id: user.id,
          token_hash: 'refresh-token-hash',
          token_family: 'token-family',
          expires_at: now,
          device_id: 'body-device',
          device_name: meta.deviceName,
          ip_address: '127.0.0.1',
          user_agent: meta.userAgent,
        },
      },
      txCtx,
    );
  });

  it('rotates refresh token in one transaction', async () => {
    mockRefreshTokensRepository.findByHash.mockResolvedValue({
      user_id: user.id,
      token_family: 'token-family',
      is_revoked: false,
      used_at: null,
      expires_at: new Date('2026-05-04T00:00:00.000Z'),
      user: { isActive: true, deletedAt: null },
    });
    mockTransactionManager.run.mockImplementation((work) => work(txCtx));
    mockUsersRepository.findByIdWithRoles.mockResolvedValue(user);
    mockTokenService.hashRefreshToken
      .mockReturnValueOnce('old-token-hash')
      .mockReturnValueOnce('new-token-hash');
    mockTokenService.generateTokenPair.mockReturnValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tokenFamily: 'new-token-family',
    });
    mockTokenService.getRefreshTokenExpiresAt.mockReturnValue(now);
    mockTokenService.getAccessTokenExpiresInSeconds.mockReturnValue(900);

    const result = await service.refresh('old-refresh-token', meta);

    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mockRefreshTokensRepository.revokeByHash).toHaveBeenCalledWith(
      'old-token-hash',
      txCtx,
    );
    expect(mockRefreshTokensRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token_hash: 'new-token-hash',
          token_family: 'token-family',
        }),
      }),
      txCtx,
    );
  });

  it('changes password and revokes all refresh tokens in one transaction', async () => {
    mockUsersRepository.findByIdWithRoles.mockResolvedValue(user);
    mockPasswordHasher.verify.mockResolvedValue(true);
    mockPasswordHasher.hash.mockResolvedValue('new-hashed-password');
    mockTransactionManager.run.mockImplementation((work) => work(txCtx));

    const result = await service.changePassword(
      {
        sub: user.id,
        username: user.username,
        displayName: user.displayName,
        tokenVersion: user.token_version,
        roles: ['Admin'],
      },
      {
        currentPassword: 'Password@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      },
    );

    expect(result.message).toContain('Đổi mật khẩu thành công');
    expect(mockUsersRepository.update).toHaveBeenCalledWith(
      {
        where: { id: user.id },
        data: {
          hashed_password: 'new-hashed-password',
          token_version: { increment: 1 },
        },
      },
      txCtx,
    );
    expect(mockRefreshTokensRepository.revokeAllForUser).toHaveBeenCalledWith(
      user.id,
      txCtx,
    );
  });
});
