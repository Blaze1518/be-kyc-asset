import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequestMeta } from 'src/modules/auth/interface/auth-meta.interface';

export const GetAuthMeta = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthRequestMeta => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
      deviceId: request.get('x-device-id'),
      deviceName: request.get('x-device-name'),
    };
  },
);
