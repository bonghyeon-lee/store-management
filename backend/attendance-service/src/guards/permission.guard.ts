import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthUser } from './auth.guard';

/**
 * 권한 Enum (Auth 서비스와 동일한 구조)
 */
export enum Permission {
  // 근태 관련 권한
  VIEW_ATTENDANCE = 'VIEW_ATTENDANCE',
  MANAGE_ATTENDANCE = 'MANAGE_ATTENDANCE',
  APPROVE_ATTENDANCE = 'APPROVE_ATTENDANCE',
}

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

/**
 * 권한 기반 접근 제어 데코레이터
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * 역할 기반 접근 제어 데코레이터
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * 역할별 권한 매핑
 */
const ROLE_PERMISSIONS: Map<string, Permission[]> = new Map([
  [
    'HQ_ADMIN',
    [
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE,
      Permission.APPROVE_ATTENDANCE,
    ],
  ],
  [
    'STORE_MANAGER',
    [
      Permission.VIEW_ATTENDANCE,
      Permission.APPROVE_ATTENDANCE, // 점장은 근태 승인 권한 있음
    ],
  ],
  [
    'EMPLOYEE',
    [
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE, // 본인 근태만
    ],
  ],
]);

/**
 * 권한 기반 접근 제어 Guard
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const user = request?.user as AuthUser | undefined;
    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }

    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    const requiredPermissions = this.reflector.get<Permission[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

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
      const userPermissions = ROLE_PERMISSIONS.get(user.role) || [];
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `이 작업을 수행하려면 다음 권한 중 하나가 필요합니다: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}

