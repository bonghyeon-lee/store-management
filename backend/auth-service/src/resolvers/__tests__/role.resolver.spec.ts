import { Test, TestingModule } from '@nestjs/testing';
import { RoleResolver } from '../role.resolver';
import { PermissionService } from '../../services/permission.service';
import { Permission } from '../../models/role.model';
import { users } from '../auth.resolver';
import { roles, userRoleAssignments } from '../role.resolver';

describe('RoleResolver', () => {
  let resolver: RoleResolver;
  let permissionService: PermissionService;

  beforeEach(async () => {
    // 테스트 데이터 초기화 (모듈 생성 전에)
    users.clear();
    roles.clear();
    userRoleAssignments.clear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleResolver, PermissionService],
    }).compile();

    resolver = module.get<RoleResolver>(RoleResolver);
    permissionService = module.get<PermissionService>(PermissionService);
  });

  describe('roles', () => {
    it('기본 역할 목록을 반환해야 함', () => {
      const result = resolver.roles();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.name === 'HQ_ADMIN')).toBe(true);
      expect(result.some((r) => r.name === 'STORE_MANAGER')).toBe(true);
      expect(result.some((r) => r.name === 'EMPLOYEE')).toBe(true);
    });
  });

  describe('userPermissions', () => {
    it('HQ_ADMIN 역할의 권한을 반환해야 함', () => {
      const mockContext = {
        req: {
          user: {
            userId: 'user-1',
            role: 'HQ_ADMIN',
          },
        },
      };

      const result = resolver.userPermissions('user-1', mockContext);
      expect(result).toContain(Permission.VIEW_ALL_STORES);
      expect(result).toContain(Permission.MANAGE_POLICIES);
      expect(result).toContain(Permission.VIEW_EMPLOYEES);
    });

    it('STORE_MANAGER 역할의 권한을 반환해야 함', () => {
      const mockContext = {
        req: {
          user: {
            userId: 'user-2',
            role: 'STORE_MANAGER',
          },
        },
      };

      const result = resolver.userPermissions('user-2', mockContext);
      expect(result).toContain(Permission.VIEW_ATTENDANCE);
      expect(result).toContain(Permission.APPROVE_ATTENDANCE);
      expect(result).not.toContain(Permission.VIEW_ALL_STORES);
    });

    it('EMPLOYEE 역할의 권한을 반환해야 함', () => {
      const mockContext = {
        req: {
          user: {
            userId: 'user-3',
            role: 'EMPLOYEE',
          },
        },
      };

      const result = resolver.userPermissions('user-3', mockContext);
      expect(result).toContain(Permission.VIEW_ATTENDANCE);
      expect(result).toContain(Permission.MANAGE_ATTENDANCE);
      expect(result).not.toContain(Permission.APPROVE_ATTENDANCE);
    });
  });
});

