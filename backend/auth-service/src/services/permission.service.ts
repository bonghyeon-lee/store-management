import { Injectable } from '@nestjs/common';
import { Permission, Role } from '../models/role.model';
import { UserRole } from '../models/user.model';

/**
 * 권한 관리 서비스
 * 역할별 권한 매핑 및 권한 체크 로직
 */
@Injectable()
export class PermissionService {
  // 기본 역할별 권한 정의
  private readonly rolePermissions: Map<string, Permission[]> = new Map([
    [
      'HQ_ADMIN',
      [
        Permission.VIEW_ALL_STORES,
        Permission.VIEW_ATTENDANCE,
        Permission.MANAGE_ATTENDANCE,
        Permission.APPROVE_ATTENDANCE,
        Permission.VIEW_INVENTORY,
        Permission.MANAGE_INVENTORY,
        Permission.APPROVE_PURCHASE_ORDER,
        Permission.VIEW_SALES,
        Permission.MANAGE_SALES,
        Permission.VIEW_SALES_REPORT,
        Permission.VIEW_EMPLOYEES,
        Permission.MANAGE_EMPLOYEES,
        Permission.MANAGE_POLICIES,
      ],
    ],
    [
      'STORE_MANAGER',
      [
        Permission.VIEW_ATTENDANCE,
        Permission.APPROVE_ATTENDANCE,
        Permission.VIEW_INVENTORY,
        Permission.MANAGE_INVENTORY,
        Permission.APPROVE_PURCHASE_ORDER,
        Permission.VIEW_SALES,
        Permission.VIEW_SALES_REPORT,
        Permission.VIEW_EMPLOYEES,
      ],
    ],
    [
      'EMPLOYEE',
      [
        Permission.VIEW_ATTENDANCE,
        Permission.MANAGE_ATTENDANCE, // 본인 근태만
        Permission.VIEW_INVENTORY,
        Permission.MANAGE_INVENTORY, // 재고 실사 입력만
      ],
    ],
  ]);

  /**
   * 사용자 역할에 대한 권한 목록 조회
   */
  getPermissionsForRole(role: string): Permission[] {
    return this.rolePermissions.get(role) || [];
  }

  /**
   * 사용자가 특정 권한을 가지고 있는지 확인
   */
  hasPermission(userRole: string, permission: Permission): boolean {
    const permissions = this.getPermissionsForRole(userRole);
    return permissions.includes(permission);
  }

  /**
   * 사용자가 여러 권한 중 하나라도 가지고 있는지 확인
   */
  hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
    return permissions.some((perm) => this.hasPermission(userRole, perm));
  }

  /**
   * 사용자가 모든 권한을 가지고 있는지 확인
   */
  hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
    return permissions.every((perm) => this.hasPermission(userRole, perm));
  }

  /**
   * 지점 접근 권한 확인
   * HQ_ADMIN은 모든 지점 접근 가능
   * STORE_MANAGER와 EMPLOYEE는 할당된 지점만 접근 가능
   */
  canAccessStore(userRole: string, userStoreId: string | undefined, targetStoreId: string): boolean {
    if (userRole === 'HQ_ADMIN') {
      return true;
    }
    return userStoreId === targetStoreId;
  }
}

