import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResolver } from './employee.resolver';
import { EmploymentStatus } from '../models/employee.model';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../models/inputs.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeEntity } from '../entities/employee.entity';

// TypeORM Mock Repository
const mockEmployeeRepository = {
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('EmployeeResolver', () => {
  let resolver: EmployeeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeResolver,
        {
          provide: getRepositoryToken(EmployeeEntity),
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    resolver = module.get<EmployeeResolver>(EmployeeResolver);
    // Mock 초기화
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('employee', () => {
    it('should return employee by id', () => {
      const result = resolver.employee('EMP-001');

      expect(result).toBeDefined();
      expect(result?.id).toBe('EMP-001');
      expect(result?.name).toBe('홍길동');
    });

    it('should return null for non-existent employee', () => {
      const result = resolver.employee('EMP-999');

      expect(result).toBeNull();
    });
  });

  describe('employees', () => {
    beforeEach(() => {
      // TODO: TypeORM Mock 데이터 설정 필요
    });

    it('should return all employees', () => {
      const result = resolver.employees();

      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by storeId', () => {
      const result = resolver.employees('STORE-001');

      expect(result.every((emp) => emp.assignedStoreIds.includes('STORE-001'))).toBe(true);
    });

    it('should filter by role', () => {
      const result = resolver.employees(undefined, 'EMPLOYEE');

      expect(result.every((emp) => emp.role === 'EMPLOYEE')).toBe(true);
    });

    it('should filter by status', () => {
      const result = resolver.employees(undefined, undefined, EmploymentStatus.ACTIVE);

      expect(result.every((emp) => emp.employmentStatus === EmploymentStatus.ACTIVE)).toBe(true);
    });
  });

  describe('createEmployee', () => {
    it('should create a new employee', () => {
      const input: CreateEmployeeInput = {
        name: '박민수',
        email: 'park@example.com',
        phone: '010-4567-8901',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      };

      const result = resolver.createEmployee(input);

      expect(result).toBeDefined();
      expect(result.name).toBe('박민수');
      expect(result.email).toBe('park@example.com');
      expect(result.role).toBe('EMPLOYEE');
      expect(result.employmentStatus).toBe(EmploymentStatus.ACTIVE);
      // TODO: TypeORM Mock 검증 필요
      expect(result).toBeDefined();
    });

    it('should throw error when name is empty', () => {
      const input: CreateEmployeeInput = {
        name: '',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      };

      expect(() => resolver.createEmployee(input)).toThrow('이름은 필수 입력 항목입니다');
    });

    it('should throw error when assignedStoreIds is empty', () => {
      const input: CreateEmployeeInput = {
        name: '박민수',
        role: 'EMPLOYEE',
        assignedStoreIds: [],
      };

      expect(() => resolver.createEmployee(input)).toThrow('할당된 지점 ID는 최소 1개 이상 필요합니다');
    });

    it('should throw error for invalid email format', () => {
      const input: CreateEmployeeInput = {
        name: '박민수',
        email: 'invalid-email',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      };

      expect(() => resolver.createEmployee(input)).toThrow('올바른 이메일 형식이 아닙니다');
    });
  });

  describe('updateEmployee', () => {
    it('should update employee information', () => {
      // TODO: TypeORM Mock 데이터 조회 필요
      const originalEmployee = null;
      const originalCreatedAt = originalEmployee?.createdAt;

      const input: UpdateEmployeeInput = {
        name: '홍길동 수정',
        email: 'hong-updated@example.com',
      };

      // 약간의 지연을 주어 updatedAt이 다르게 생성되도록 함
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = resolver.updateEmployee('EMP-001', input);

          expect(result.name).toBe('홍길동 수정');
          expect(result.email).toBe('hong-updated@example.com');
          expect(result.updatedAt).toBeDefined();
          expect(typeof result.updatedAt).toBe('string');
          expect(result.createdAt).toBe(originalCreatedAt);
          expect(result.updatedAt).not.toBe(originalEmployee?.updatedAt);
          resolve();
        }, 10);
      });
    });

    it('should throw error when employee not found', () => {
      const input: UpdateEmployeeInput = {
        name: '수정된 이름',
      };

      expect(() => resolver.updateEmployee('EMP-999', input)).toThrow('직원을 찾을 수 없습니다');
    });

    it('should throw error when name is empty string', () => {
      const input: UpdateEmployeeInput = {
        name: '',
      };

      expect(() => resolver.updateEmployee('EMP-001', input)).toThrow('이름은 비어있을 수 없습니다');
    });
  });

  describe('deleteEmployee', () => {
    it('should deactivate employee', () => {
      const result = resolver.deleteEmployee('EMP-001');

      expect(result).toBe(true);
      // TODO: TypeORM Mock 검증 필요
      // const employee = await mockEmployeeRepository.findOne(...);
      // expect(employee?.employmentStatus).toBe(EmploymentStatus.INACTIVE);
    });

    it('should return false for non-existent employee', () => {
      const result = resolver.deleteEmployee('EMP-999');

      expect(result).toBe(false);
    });
  });
});

