import { Test } from '@nestjs/testing';
import { PermissionService } from '../permission.service';
import { Permission } from '../../models/role.model';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PermissionService],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  describe('getPermissionsForRole', () => {
    it('HQ_ADMIN의 모든 권한을 반환해야 함', () => {
      const permissions = service.getPermissionsForRole('HQ_ADMIN');
      expect(permissions).toContain(Permission.VIEW_ALL_STORES);
      expect(permissions).toContain(Permission.MANAGE_POLICIES);
      expect(permissions).toContain(Permission.VIEW_EMPLOYEES);
      expect(permissions).toContain(Permission.MANAGE_EMPLOYEES);
    });

    it('STORE_MANAGER의 권한을 반환해야 함', () => {
      const permissions = service.getPermissionsForRole('STORE_MANAGER');
      expect(permissions).toContain(Permission.VIEW_ATTENDANCE);
      expect(permissions).toContain(Permission.APPROVE_ATTENDANCE);
      expect(permissions).not.toContain(Permission.VIEW_ALL_STORES);
    });

    it('EMPLOYEE의 권한을 반환해야 함', () => {
      const permissions = service.getPermissionsForRole('EMPLOYEE');
      expect(permissions).toContain(Permission.VIEW_ATTENDANCE);
      expect(permissions).toContain(Permission.MANAGE_ATTENDANCE);
      expect(permissions).not.toContain(Permission.APPROVE_ATTENDANCE);
    });
  });

  describe('hasPermission', () => {
    it('HQ_ADMIN이 VIEW_ALL_STORES 권한을 가지고 있어야 함', () => {
      expect(service.hasPermission('HQ_ADMIN', Permission.VIEW_ALL_STORES)).toBe(true);
    });

    it('STORE_MANAGER가 VIEW_ALL_STORES 권한을 가지고 있지 않아야 함', () => {
      expect(service.hasPermission('STORE_MANAGER', Permission.VIEW_ALL_STORES)).toBe(false);
    });
  });

  describe('canAccessStore', () => {
    it('HQ_ADMIN은 모든 지점에 접근할 수 있어야 함', () => {
      expect(service.canAccessStore('HQ_ADMIN', undefined, 'store-1')).toBe(true);
      expect(service.canAccessStore('HQ_ADMIN', 'store-1', 'store-2')).toBe(true);
    });

    it('STORE_MANAGER는 할당된 지점만 접근할 수 있어야 함', () => {
      expect(service.canAccessStore('STORE_MANAGER', 'store-1', 'store-1')).toBe(true);
      expect(service.canAccessStore('STORE_MANAGER', 'store-1', 'store-2')).toBe(false);
    });

    it('EMPLOYEE는 할당된 지점만 접근할 수 있어야 함', () => {
      expect(service.canAccessStore('EMPLOYEE', 'store-1', 'store-1')).toBe(true);
      expect(service.canAccessStore('EMPLOYEE', 'store-1', 'store-2')).toBe(false);
    });
  });
});

