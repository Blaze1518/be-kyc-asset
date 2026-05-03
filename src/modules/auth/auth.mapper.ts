import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  AuthMessageResponseDto,
  AuthTokenResponseDto,
  AuthUserResponseDto,
} from './dto/auth-response.dto';
import type { AuthMessageResult, AuthSessionResult } from './auth.service';
import type { UserWithRoles } from 'src/modules/users/repositories/users.repository';

@Injectable()
export class AuthMapper {
  toUserResponse(user: UserWithRoles): AuthUserResponseDto {
    return plainToInstance(
      AuthUserResponseDto,
      {
        ...user,
        roles: user.roles.map((userRole) => userRole.role),
      },
      { excludeExtraneousValues: true },
    );
  }

  toSessionResponse(session: AuthSessionResult): AuthTokenResponseDto {
    return plainToInstance(
      AuthTokenResponseDto,
      {
        expiresIn: session.expiresIn,
        user: this.toUserResponse(session.user),
        message: session.message,
      },
      { excludeExtraneousValues: true },
    );
  }

  toMessageResponse(result: AuthMessageResult): AuthMessageResponseDto {
    return plainToInstance(AuthMessageResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
