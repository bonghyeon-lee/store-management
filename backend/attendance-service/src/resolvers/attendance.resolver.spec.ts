import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceStatus } from '../models/attendance.model';
import { CheckInInput, CheckOutInput } from '../models/inputs.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceEntity } from '../entities/attendance.entity';
import {
  createMockRepository,
  createMockQueryBuilder,
  setupQueryBuilderMock,
} from '../test-utils/typeorm-mock';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('AttendanceResolver', () => {
  let resolver: AttendanceResolver;
  let mockRepository: Repository<AttendanceEntity>;
  let mockQueryBuilder: SelectQueryBuilder<AttendanceEntity>;

  beforeEach(async () => {
    mockRepository = createMockRepository<AttendanceEntity>();
    mockQueryBuilder = createMockQueryBuilder<AttendanceEntity>();
    setupQueryBuilderMock(mockRepository, mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceResolver,
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    resolver = module.get<AttendanceResolver>(AttendanceResolver);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('checkIn', () => {
    it('should create a new attendance record', async () => {
      const input: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
        notes: '출근',
      };

      // findOne이 null을 반환 (새로운 기록)
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      // save가 저장된 엔티티를 반환
      const savedEntity = new AttendanceEntity();
      savedEntity.storeId = input.storeId;
      savedEntity.employeeId = input.employeeId;
      savedEntity.date = input.date;
      savedEntity.checkInAt = new Date(input.checkInAt);
      savedEntity.status = AttendanceStatus.PENDING;
      savedEntity.notes = input.notes;
      savedEntity.updatedAt = new Date();

      (mockRepository.save as jest.Mock).mockResolvedValue(savedEntity);

      const result = await resolver.checkIn(input);

      expect(result).toBeDefined();
      expect(result.storeId).toBe('STORE-001');
      expect(result.employeeId).toBe('EMP-001');
      expect(result.date).toBe('2024-01-01');
      expect(result.status).toBe(AttendanceStatus.PENDING);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          storeId: input.storeId,
          employeeId: input.employeeId,
          date: input.date,
        },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when storeId is empty', async () => {
      const input: CheckInInput = {
        storeId: '',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };

      await expect(resolver.checkIn(input)).rejects.toThrow(
        '지점 ID는 필수 입력 항목입니다.'
      );
    });

    it('should throw error when date format is invalid', async () => {
      const input: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024/01/01',
        checkInAt: '2024-01-01T09:00:00',
      };

      await expect(resolver.checkIn(input)).rejects.toThrow(
        '날짜 형식이 올바르지 않습니다'
      );
    });

    it('should update existing attendance record', async () => {
      const input: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };

      // 기존 기록이 있는 경우
      const existingEntity = new AttendanceEntity();
      existingEntity.storeId = input.storeId;
      existingEntity.employeeId = input.employeeId;
      existingEntity.date = input.date;
      existingEntity.checkInAt = new Date('2024-01-01T08:00:00');
      existingEntity.status = AttendanceStatus.PENDING;
      existingEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      const updatedEntity = { ...existingEntity };
      updatedEntity.checkInAt = new Date(input.checkInAt);
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedEntity);

      const result = await resolver.checkIn(input);

      expect(result.checkInAt).toBe('2024-01-01T09:00:00');
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('checkOut', () => {
    it('should update attendance with checkout time', async () => {
      const input: CheckOutInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkOutAt: '2024-01-01T18:00:00',
      };

      // 기존 출근 기록이 있는 경우
      const existingEntity = new AttendanceEntity();
      existingEntity.storeId = input.storeId;
      existingEntity.employeeId = input.employeeId;
      existingEntity.date = input.date;
      existingEntity.checkInAt = new Date('2024-01-01T09:00:00');
      existingEntity.status = AttendanceStatus.PENDING;
      existingEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      const updatedEntity = { ...existingEntity };
      updatedEntity.checkOutAt = new Date(input.checkOutAt);
      updatedEntity.workingHours = 9;
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedEntity);

      const result = await resolver.checkOut(input);

      expect(result.checkOutAt).toBe('2024-01-01T18:00:00');
      expect(result.workingHours).toBeDefined();
      expect(result.workingHours).toBe(9);
    });

    it('should throw error when no check-in record exists', async () => {
      const input: CheckOutInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-002',
        date: '2024-01-01',
        checkOutAt: '2024-01-01T18:00:00',
      };

      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(resolver.checkOut(input)).rejects.toThrow(
        '출근 기록을 먼저 입력해주세요'
      );
    });

    it('should throw error when checkout time is before checkin time', async () => {
      const input: CheckOutInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkOutAt: '2024-01-01T08:00:00',
      };

      const existingEntity = new AttendanceEntity();
      existingEntity.storeId = input.storeId;
      existingEntity.employeeId = input.employeeId;
      existingEntity.date = input.date;
      existingEntity.checkInAt = new Date('2024-01-01T09:00:00');

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      await expect(resolver.checkOut(input)).rejects.toThrow(
        '퇴근 시간은 출근 시간보다 늦어야 합니다'
      );
    });
  });

  describe('approveAttendance', () => {
    it('should approve attendance', async () => {
      const storeId = 'STORE-001';
      const employeeId = 'EMP-001';
      const date = '2024-01-01';

      const existingEntity = new AttendanceEntity();
      existingEntity.storeId = storeId;
      existingEntity.employeeId = employeeId;
      existingEntity.date = date;
      existingEntity.checkInAt = new Date('2024-01-01T09:00:00');
      existingEntity.status = AttendanceStatus.PENDING;
      existingEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      const approvedEntity = { ...existingEntity };
      approvedEntity.status = AttendanceStatus.APPROVED;
      (mockRepository.save as jest.Mock).mockResolvedValue(approvedEntity);

      const result = await resolver.approveAttendance(
        storeId,
        employeeId,
        date,
        '승인'
      );

      expect(result.status).toBe(AttendanceStatus.APPROVED);
    });

    it('should throw error when attendance not found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        resolver.approveAttendance('STORE-001', 'EMP-002', '2024-01-01')
      ).rejects.toThrow('출퇴근 기록을 찾을 수 없습니다');
    });

    it('should throw error when already approved', async () => {
      const existingEntity = new AttendanceEntity();
      existingEntity.storeId = 'STORE-001';
      existingEntity.employeeId = 'EMP-001';
      existingEntity.date = '2024-01-01';
      existingEntity.status = AttendanceStatus.APPROVED;
      existingEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      await expect(
        resolver.approveAttendance('STORE-001', 'EMP-001', '2024-01-01')
      ).rejects.toThrow('이미 승인된 근태 기록입니다');
    });
  });

  describe('rejectAttendance', () => {
    it('should reject attendance', async () => {
      const storeId = 'STORE-001';
      const employeeId = 'EMP-001';
      const date = '2024-01-01';

      const existingEntity = new AttendanceEntity();
      existingEntity.storeId = storeId;
      existingEntity.employeeId = employeeId;
      existingEntity.date = date;
      existingEntity.status = AttendanceStatus.PENDING;
      existingEntity.updatedAt = new Date();

      (mockRepository.findOne as jest.Mock).mockResolvedValue(existingEntity);

      const rejectedEntity = { ...existingEntity };
      rejectedEntity.status = AttendanceStatus.REJECTED;
      rejectedEntity.notes = '거부 사유';
      (mockRepository.save as jest.Mock).mockResolvedValue(rejectedEntity);

      const result = await resolver.rejectAttendance(
        storeId,
        employeeId,
        date,
        '거부 사유'
      );

      expect(result.status).toBe(AttendanceStatus.REJECTED);
      expect(result.notes).toBe('거부 사유');
    });

    it('should throw error when notes is empty', async () => {
      await expect(
        resolver.rejectAttendance('STORE-001', 'EMP-001', '2024-01-01', '')
      ).rejects.toThrow('거부 사유는 필수 입력 항목입니다');
    });
  });

  describe('attendanceRecords', () => {
    it('should filter by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-02';

      const mockEntities = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-02',
          checkInAt: new Date('2024-01-02T09:00:00'),
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      (mockQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.attendanceRecords(
        startDate,
        endDate,
        undefined,
        undefined,
        undefined
      );

      expect(result.length).toBe(2);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should filter by storeId', async () => {
      const mockEntities = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      (mockQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.attendanceRecords(
        '2024-01-01',
        '2024-01-03',
        'STORE-001',
        undefined,
        undefined
      );

      expect(result.length).toBe(1);
      expect(result[0].storeId).toBe('STORE-001');
    });

    it('should filter by status', async () => {
      const mockEntities = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          status: AttendanceStatus.APPROVED,
        },
      ] as AttendanceEntity[];

      (mockQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.attendanceRecords(
        '2024-01-01',
        '2024-01-03',
        undefined,
        undefined,
        AttendanceStatus.APPROVED
      );

      expect(result.length).toBe(1);
      expect(result[0].status).toBe(AttendanceStatus.APPROVED);
    });
  });

  describe('pendingApprovals', () => {
    it('should return only pending approvals', async () => {
      const mockEntities = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-002',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      (mockQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockEntities);

      const result = await resolver.pendingApprovals(undefined, undefined);

      expect(result.length).toBe(1);
      expect(result[0].status).toBe(AttendanceStatus.PENDING);
      expect(result[0].employeeId).toBe('EMP-002');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'attendance.status = :status',
        { status: AttendanceStatus.PENDING }
      );
    });
  });
});
