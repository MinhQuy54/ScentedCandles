import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/constants';
import { METHOD_TO_ACTION, PermissionAction } from '../types/permission-action.type';
import {
  PERMISSION_KEY,
  PermissionMetadata,
} from '../decorators/permission.decorator';
import { DynamicRbacService } from '../dynamic-rbac.service';

@Injectable()
export class DynamicRbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: DynamicRbacService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<PermissionMetadata>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata?.pathCode) {
      throw new ForbiddenException('PERMISSION_METADATA_REQUIRED');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.roleSetting?.id) {
      throw new ForbiddenException('NO_ROLE_ASSIGNED');
    }

    const action =
      metadata.action ?? METHOD_TO_ACTION[request.method] ?? 'view';
    const allowed = await this.rbacService.can(
      user.roleSetting.id,
      metadata.pathCode,
      action,
    );

    const fallbackAllowed = this.isDebtStaffFallbackAllowed(
      user,
      metadata.pathCode,
      action,
      allowed,
    );

    if (!fallbackAllowed) throw new ForbiddenException('PERMISSION_DENIED');
    return true;
  }

  private isDebtStaffFallbackAllowed(
    user: any,
    pathCode: string,
    action: PermissionAction,
    allowed: boolean,
  ): boolean {
    if (allowed) {
      return true;
    }

    const roleCode = user?.roleSetting?.code ?? user?.role;
    if (pathCode !== 'DEBT' || roleCode !== UserRole.STAFF) {
      return false;
    }

    return ['view', 'create', 'update'].includes(action);
  }
}
