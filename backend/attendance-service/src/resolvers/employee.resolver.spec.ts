import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResolver } from './employee.resolver';
import { EmploymentStatus } from '../models/employee.model';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../models/inputs.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeEntity } from '../entities/employee.entity';
import {
  createMockRepository,
  createMockQueryBuilder,
  setupQueryBuilderMock,
} from '../test-utils/typeorm-mock';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('EmployeeResolver', () => {
  let resolver: EmployeeResolver;
  let mockRepository: Repository<EmployeeEntity>;
  let mockQueryBuilder: SelectQueryBuilder<EmployeeEntity>;

  beforeEach(async () => {
    mockRepository = createMockRepository<EmployeeEntity>();
    mockQueryBuilder = createMockQueryBuilder<EmployeeEntity>();
    setupQueryBuilderMock(mockRepository, mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeResolver,
        {
          provide: getRepositoryToken(EmployeeEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    resolver = module.get<EmployeeResolver>(EmployeeResolver);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('employee', () => {
    it('should return employee by id', async () => {
      const employeeId = 'EMP-001';
      const mockEntity = new EmployeeEntity();
      mockEntity.id = employeeId;
      mockEntity.name = '홍길동';
      mockEntity.email = 'hong@example.com';
      mockEntity.role = 'STORE_MANAGER';
      mockEntity.employmentStatus = EmploymentStatus.ACTIVE;
      mockEntity.assignedStoreIds = ['STORE-001'];
      mockEntity.createdAt = new Date();
      mockEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockEntity);

      const result = await resolver.employee(employeeId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(employeeId);
      expect(result?.name).toBe('홍길동');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: employeeId },
      });
    });

    it('should return null for non-existent employee', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await resolver.employee('EMP-999');

      expect(result).toBeNull();
    });
  });

  describe('employees', () => {
    it('should return all employees', async () => {
      const mockEntities = [
        {
          id: 'EMP-001',
          name: '홍길동',
          role: 'STORE_MANAGER',
          employmentStatus: EmploymentStatus.ACTIVE,
          assignedStoreIds: ['STORE-001'],
        },
        {
          id: 'EMP-002',
          name: '김철수',
          role: 'EMPLOYEE',
          employmentStatus: EmploymentStatus.ACTIVE,
          assignedStoreIds: ['STORE-001'],
        },
      ] as EmployeeEntity[];

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.employees();

      expect(result.length).toBeGreaterThan(0);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should filter by storeId', async () => {
      const mockEntities = [
        {
          id: 'EMP-001',
          name: '홍길동',
          role: 'EMPLOYEE',
          employmentStatus: EmploymentStatus.ACTIVE,
          assignedStoreIds: ['STORE-001'],
        },
      ] as EmployeeEntity[];

      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.employees('STORE-001');

      expect(result.every((emp) => emp.assignedStoreIds.includes('STORE-001'))).toBe(true);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by role', async () => {
      const mockEntities = [
        {
          id: 'EMP-002',
          name: '김철수',
          role: 'EMPLOYEE',
          employmentStatus: EmploymentStatus.ACTIVE,
          assignedStoreIds: ['STORE-001'],
        },
      ] as EmployeeEntity[];

      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.employees(undefined, 'EMPLOYEE');

      expect(result.every((emp) => emp.role === 'EMPLOYEE')).toBe(true);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('employee.role = :role', {
        role: 'EMPLOYEE',
      });
    });

    it('should filter by status', async () => {
      const mockEntities = [
        {
          id: 'EMP-001',
          name: '홍길동',
          role: 'EMPLOYEE',
          employmentStatus: EmploymentStatus.ACTIVE,
          assignedStoreIds: ['STORE-001'],
        },
      ] as EmployeeEntity[];

      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.employees(
        undefined,
        undefined,
        EmploymentStatus.ACTIVE,
      );

      expect(result.every((emp) => emp.employmentStatus === EmploymentStatus.ACTIVE)).toBe(true);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'employee.employmentStatus = :status',
        { status: EmploymentStatus.ACTIVE },
      );
    });
  });

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const input: CreateEmployeeInput = {
        name: '박민수',
        email: 'park@example.com',
        phone: '010-4567-8901',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      };

      const savedEntity = new EmployeeEntity();
      savedEntity.id = 'EMP-003';
      savedEntity.name = input.name;
      savedEntity.email = input.email;
      savedEntity.phone = input.phone;
      savedEntity.role = input.role;
      savedEntity.employmentStatus = EmploymentStatus.ACTIVE;
      savedEntity.assignedStoreIds = input.assignedStoreIds;
      savedEntity.createdAt = new Date();
      savedEntity.updatedAt = new Date();

      (mockRepository.create as jest.Mock).mockReturnValue(savedEntity);
      (mockRepository.save as jest.Mock).mockResolvedValue(savedEntity);

      const result = await resolver.createEmployee(input);

      expect(result).toBeDefined();
      expect(result.name).toBe('박민수');
      expect(result.email).toBe('park@example.com');
      expect(result.role).toBe('EMPLOYEE');
      expect(result.employmentStatus).toBe(EmploymentStatus.ACTIVE);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when name is empty', async () => {
      const input: CreateEmployeeInput = {
        name: '',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      };

      await expect(resolver.createEmployee(input)).rejects.toThrow(
        '이름은 필수 입력 항목입니다.',
      );
    });

    it('should throw error when assignedStoreIds is empty', async () => {
      const input: CreateEmployeeInput = {
        name: '박민수',
        role: 'EMPLOYEE',
        assignedStoreIds: [],
      };

      await expect(resolver.createEmployee(input)).rejects.toThrow(
        '할당된 지점 ID는 최소 1개 이상 필요합니다.',
      );
    });

    it('should throw error for invalid email format', async () => {
      const input: CreateEmployeeInput = {
        name: '박민수',
        email: 'invalid-email',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      };

      await expect(resolver.createEmployee(input)).rejects.toThrow(
        '올바른 이메일 형식이 아닙니다.',
      );
    });
  });

  describe('updateEmployee', () => {
    it('should update employee information', async () => {
      const employeeId = 'EMP-001';
      const originalEntity = new EmployeeEntity();
      originalEntity.id = employeeId;
      originalEntity.name = '홍길동';
      originalEntity.email = 'hong@example.com';
      originalEntity.role = 'EMPLOYEE';
      originalEntity.employmentStatus = EmploymentStatus.ACTIVE;
      originalEntity.assignedStoreIds = ['STORE-001'];
      originalEntity.createdAt = new Date('2024-01-01');
      originalEntity.updatedAt = new Date('2024-01-01');

      const updatedEntity = { ...originalEntity };
      updatedEntity.name = '홍길동 수정';
      updatedEntity.email = 'hong-updated@example.com';
      updatedEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(originalEntity);
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedEntity);

      const input: UpdateEmployeeInput = {
        name: '홍길동 수정',
        email: 'hong-updated@example.com',
      };

      const result = await resolver.updateEmployee(employeeId, input);

      expect(result.name).toBe('홍길동 수정');
      expect(result.email).toBe('hong-updated@example.com');
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt).toBe(originalEntity.createdAt.toISOString());
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: employeeId } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when employee not found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      const input: UpdateEmployeeInput = {
        name: '수정된 이름',
      };

      await expect(resolver.updateEmployee('EMP-999', input)).rejects.toThrow(
        '직원을 찾을 수 없습니다: EMP-999',
      );
    });

    it('should throw error when name is empty string', async () => {
      const existingEntity = new EmployeeEntity();
      existingEntity.id = 'EMP-001';
      existingEntity.name = '홍길동';

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      const input: UpdateEmployeeInput = {
        name: '',
      };

      await expect(resolver.updateEmployee('EMP-001', input)).rejects.toThrow(
        '이름은 비어있을 수 없습니다.',
      );
    });
  });

  describe('deleteEmployee', () => {
    it('should deactivate employee', async () => {
      const employeeId = 'EMP-001';
      const existingEntity = new EmployeeEntity();
      existingEntity.id = employeeId;
      existingEntity.name = '홍길동';
      existingEntity.employmentStatus = EmploymentStatus.ACTIVE;

      const deactivatedEntity = { ...existingEntity };
      deactivatedEntity.employmentStatus = EmploymentStatus.INACTIVE;

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);
      (mockRepository.save as jest.Mock).mockResolvedValue(deactivatedEntity);

      const result = await resolver.deleteEmployee(employeeId);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: employeeId } });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ employmentStatus: EmploymentStatus.INACTIVE }),
      );
    });

    it('should return false for non-existent employee', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await resolver.deleteEmployee('EMP-999');

      expect(result).toBe(false);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});