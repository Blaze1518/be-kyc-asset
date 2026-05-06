import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  AuthMessageResponseDto,
  AuthTokenResponseDto,
  AuthUserResponseDto,
} from './dto/auth-response.dto';
import type { AuthMessageResult, AuthSessionResult } from './auth.service';
import type {
  UserWithPermissions,
  UserWithRoles,
} from 'src/modules/users/repositories/users.repository';

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

  toMeResponse(user: UserWithPermissions) {
    const rules = this.extractRules(user);

    return {
      id: user.id,
      displayName: user.displayName,
      roles: user.roles.map((r) => r.role.name),
      rules: this.deduplicateRules(rules),
    };
  }

  private extractRules(user: UserWithPermissions) {
    return user.roles.flatMap((r) =>
      r.role.permissions.map((p) => ({
        action: p.permission.action,
        subject: p.permission.subject,
        conditions: this.normalizeConditions(p.permission.conditions),
      })),
    );
  }

  private normalizeConditions(conditions: any[] | null) {
    if (!conditions?.length) return undefined;

    const result: Record<string, any> = {};

    for (const c of conditions) {
      const attr = c.attribute?.name;

      if (!attr) continue;

      if (c.conditions?.type === 'business_hours') {
        result[attr] = {
          $gte: c.conditions.start,
          $lte: c.conditions.end,
        };
        continue;
      }

      result[attr] = c.conditions;
    }

    return Object.keys(result).length ? result : undefined;
  }

  private deduplicateRules(rules: any[]) {
    const map = new Map();

    for (const r of rules) {
      const key = `${r.action}:${r.subject}`;

      if (!map.has(key)) {
        map.set(key, {
          action: r.action,
          subject: r.subject,
          conditions: r.conditions,
        });
      } else {
        const existing = map.get(key);

        if (r.conditions) {
          existing.conditions = {
            ...existing.conditions,
            ...r.conditions,
          };
        }
      }
    }

    return Array.from(map.values());
  }
}
