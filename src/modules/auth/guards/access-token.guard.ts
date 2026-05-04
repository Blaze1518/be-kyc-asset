import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '../constants/strategy.constant';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
@Injectable()
export class AccessTokenGuard extends AuthGuard(AuthStrategy.JWT_ACCESS) {
  private readonly logger = new Logger(AccessTokenGuard.name);
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    this.logger.log(`isPublic: ${isPublic}`);
    if (isPublic) {
      this.logger.log('Public route, skipping authentication');
      return true;
    }

    return super.canActivate(context);
  }
}
