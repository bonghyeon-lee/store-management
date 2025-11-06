import { Injectable, CanActivate, ExecutionContext, SetMetadata, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Permission } from '../models/role.model';
import { PermissionService } from '../services/permission.service';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/**
 * 역할 기반 접근 제어 데코레이터
 */
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * 권한 기반 접근 제어 데코레이터
 */
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * 역할 기반 접근 제어 Guard
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const user = request?.user;
    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }

    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const requiredPermissions = this.reflector.get<Permission[]>(PERMISSIONS_KEY, context.getHandler());

    // 역할 기반 체크
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(
          `이 작업을 수행하려면 다음 역할 중 하나가 필요합니다: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // 권한 기반 체크
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = this.permissionService.hasAnyPermission(user.role, requiredPermissions);
      if (!hasPermission) {
        throw new ForbiddenException(
          `이 작업을 수행하려면 다음 권한 중 하나가 필요합니다: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}

