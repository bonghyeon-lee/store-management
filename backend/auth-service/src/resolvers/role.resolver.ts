import { Query, Resolver, Args, Mutation, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role, Permission, UserRole } from '../models/role.model';
import { User, UserRole as UserRoleEnum } from '../models/user.model';
import { AuthGuard, AuthUser } from '../guards/auth.guard';
import { RolesGuard, RequireRoles, RequirePermissions } from '../guards/roles.guard';
import { PermissionService } from '../services/permission.service';
import { users } from './auth.resolver';

// 인메모리 데이터 저장소 (MVP 단계)
export const roles: Map<string, Role> = new Map();
export const userRoleAssignments: Map<string, string[]> = new Map(); // userId -> roleIds[]
let roleIdCounter = 1;

// 기본 역할 초기화
function initializeDefaultRoles(permissionService: PermissionService) {
  const defaultRoles = [
    {
      name: 'HQ_ADMIN',
      description: '본사 운영 관리자',
      permissions: permissionService.getPermissionsForRole('HQ_ADMIN'),
    },
    {
      name: 'STORE_MANAGER',
      description: '지점 점장',
      permissions: permissionService.getPermissionsForRole('STORE_MANAGER'),
    },
    {
      name: 'EMPLOYEE',
      description: '직원',
      permissions: permissionService.getPermissionsForRole('EMPLOYEE'),
    },
  ];

  defaultRoles.forEach((roleData) => {
    const roleId = `role-${roleIdCounter++}`;
    const now = new Date().toISOString();
    
    const role: Role = {
      id: roleId,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      createdAt: now,
    };
    
    roles.set(roleId, role);
  });
}

@Resolver(() => Role)
@UseGuards(AuthGuard, RolesGuard)
export class RoleResolver {
  constructor(private permissionService: PermissionService) {
    // 기본 역할 초기화
    if (roles.size === 0) {
      initializeDefaultRoles(permissionService);
    }
  }

  @Query(() => [Role], { description: '역할 목록 조회' })
  @RequirePermissions(Permission.VIEW_EMPLOYEES)
  roles(): Role[] {
    return Array.from(roles.values());
  }

  @Query(() => Role, { nullable: true, description: '역할 조회' })
  @RequirePermissions(Permission.VIEW_EMPLOYEES)
  role(@Args('id', { type: () => ID }) id: string): Role | null {
    return roles.get(id) || null;
  }

  @Query(() => [Role], { description: '사용자 역할 조회' })
  @RequirePermissions(Permission.VIEW_EMPLOYEES)
  userRoles(
    @Args('userId', { type: () => ID }) userId: string,
    @Context() context: any,
  ): Role[] {
    const user = context.req?.user as AuthUser;
    if (!user) {
      return [];
    }

    // 본인 정보 조회는 허용, 다른 사용자는 권한 필요
    if (user.userId !== userId && !this.permissionService.hasPermission(user.role, Permission.VIEW_EMPLOYEES)) {
      return [];
    }

    const roleIds = userRoleAssignments.get(userId) || [];
    const userRole = users.get(userId)?.role;
    
    // 기본 역할(사용자의 role 필드)도 포함
    const allRoleIds = [...roleIds];
    const allRoles: Role[] = [];
    
    roles.forEach((role) => {
      if (allRoleIds.includes(role.id) || role.name === userRole) {
        allRoles.push(role);
      }
    });

    return allRoles;
  }

  @Query(() => [Permission], { description: '사용자 권한 목록 조회' })
  @RequirePermissions(Permission.VIEW_EMPLOYEES)
  userPermissions(
    @Args('userId', { type: () => ID }) userId: string,
    @Context() context: any,
  ): Permission[] {
    const user = context.req?.user as AuthUser;
    if (!user) {
      return [];
    }

    // 본인 정보 조회는 허용
    if (user.userId === userId) {
      return this.permissionService.getPermissionsForRole(user.role);
    }

    // 다른 사용자 정보 조회는 권한 필요
    if (!this.permissionService.hasPermission(user.role, Permission.VIEW_EMPLOYEES)) {
      return [];
    }

    const targetUser = users.get(userId);
    if (!targetUser) {
      return [];
    }

    return this.permissionService.getPermissionsForRole(targetUser.role);
  }

  @Mutation(() => User, { description: '사용자에게 역할 할당' })
  @RequireRoles('HQ_ADMIN')
  assignRole(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
    @Context() context: any,
  ): User {
    const role = roles.get(roleId);
    if (!role) {
      throw new Error('역할을 찾을 수 없습니다.');
    }

    const user = users.get(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const currentRoleIds = userRoleAssignments.get(userId) || [];
    if (!currentRoleIds.includes(roleId)) {
      userRoleAssignments.set(userId, [...currentRoleIds, roleId]);
    }

    return user;
  }

  @Mutation(() => User, { description: '사용자 역할 제거' })
  @RequireRoles('HQ_ADMIN')
  removeRole(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
  ): User {
    const user = users.get(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const currentRoleIds = userRoleAssignments.get(userId) || [];
    const updatedRoleIds = currentRoleIds.filter((id) => id !== roleId);
    userRoleAssignments.set(userId, updatedRoleIds);

    return user;
  }
}

