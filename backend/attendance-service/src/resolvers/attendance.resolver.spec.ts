import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceStatus } from '../models/attendance.model';
import { CheckInInput, CheckOutInput } from '../models/inputs.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceEntity } from '../entities/attendance.entity';

// TypeORM Mock Repository
const mockAttendanceRepository = {
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('AttendanceResolver', () => {
  let resolver: AttendanceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceResolver,
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();

    resolver = module.get<AttendanceResolver>(AttendanceResolver);
    // Mock 초기화
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('checkIn', () => {
    it('should create a new attendance record', () => {
      const input: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
        notes: '출근',
      };

      const result = resolver.checkIn(input);

      expect(result).toBeDefined();
      expect(result.storeId).toBe('STORE-001');
      expect(result.employeeId).toBe('EMP-001');
      expect(result.date).toBe('2024-01-01');
      expect(result.checkInAt).toBe('2024-01-01T09:00:00');
      expect(result.status).toBe(AttendanceStatus.PENDING);
    });

    it('should throw error when storeId is empty', () => {
      const input: CheckInInput = {
        storeId: '',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };

      expect(() => resolver.checkIn(input)).toThrow('지점 ID는 필수 입력 항목입니다.');
    });

    it('should throw error when date format is invalid', () => {
      const input: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024/01/01',
        checkInAt: '2024-01-01T09:00:00',
      };

      expect(() => resolver.checkIn(input)).toThrow('날짜 형식이 올바르지 않습니다');
    });

    it('should update existing attendance record', () => {
      const input: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };

      resolver.checkIn(input);
      const updatedInput = { ...input, checkInAt: '2024-01-01T09:30:00' };
      const result = resolver.checkIn(updatedInput);

      expect(result.checkInAt).toBe('2024-01-01T09:30:00');
    });
  });

  describe('checkOut', () => {
    beforeEach(() => {
      // 출근 기록 먼저 생성
      const checkInInput: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };
      resolver.checkIn(checkInInput);
    });

    it('should update attendance with checkout time', () => {
      const input: CheckOutInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkOutAt: '2024-01-01T18:00:00',
      };

      const result = resolver.checkOut(input);

      expect(result.checkOutAt).toBe('2024-01-01T18:00:00');
      expect(result.workingHours).toBeDefined();
      expect(result.workingHours).toBeGreaterThan(0);
    });

    it('should throw error when no check-in record exists', () => {
      const input: CheckOutInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-002',
        date: '2024-01-01',
        checkOutAt: '2024-01-01T18:00:00',
      };

      expect(() => resolver.checkOut(input)).toThrow('출근 기록을 먼저 입력해주세요');
    });

    it('should throw error when checkout time is before checkin time', () => {
      const input: CheckOutInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkOutAt: '2024-01-01T08:00:00',
      };

      expect(() => resolver.checkOut(input)).toThrow('퇴근 시간은 출근 시간보다 늦어야 합니다');
    });
  });

  describe('approveAttendance', () => {
    beforeEach(() => {
      const checkInInput: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };
      resolver.checkIn(checkInInput);
    });

    it('should approve attendance', () => {
      const result = resolver.approveAttendance(
        'STORE-001',
        'EMP-001',
        '2024-01-01',
        '승인'
      );

      expect(result.status).toBe(AttendanceStatus.APPROVED);
    });

    it('should throw error when attendance not found', () => {
      expect(() =>
        resolver.approveAttendance('STORE-001', 'EMP-002', '2024-01-01')
      ).toThrow('출퇴근 기록을 찾을 수 없습니다');
    });

    it('should throw error when already approved', () => {
      resolver.approveAttendance('STORE-001', 'EMP-001', '2024-01-01');

      expect(() =>
        resolver.approveAttendance('STORE-001', 'EMP-001', '2024-01-01')
      ).toThrow('이미 승인된 근태 기록입니다');
    });
  });

  describe('rejectAttendance', () => {
    beforeEach(() => {
      const checkInInput: CheckInInput = {
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      };
      resolver.checkIn(checkInInput);
    });

    it('should reject attendance', () => {
      const result = resolver.rejectAttendance(
        'STORE-001',
        'EMP-001',
        '2024-01-01',
        '거부 사유'
      );

      expect(result.status).toBe(AttendanceStatus.REJECTED);
      expect(result.notes).toBe('거부 사유');
    });

    it('should throw error when notes is empty', () => {
      expect(() =>
        resolver.rejectAttendance('STORE-001', 'EMP-001', '2024-01-01', '')
      ).toThrow('거부 사유는 필수 입력 항목입니다');
    });
  });

  describe('attendanceRecords', () => {
    beforeEach(() => {
      // 여러 날짜의 출근 기록 생성
      const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
      dates.forEach((date) => {
        resolver.checkIn({
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date,
          checkInAt: `${date}T09:00:00`,
        });
      });
    });

    it('should filter by date range', () => {
      const result = resolver.attendanceRecords(
        '2024-01-01',
        '2024-01-02',
        undefined,
        undefined,
        undefined
      );

      expect(result.length).toBe(2);
    });

    it('should filter by storeId', () => {
      resolver.checkIn({
        storeId: 'STORE-002',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });

      const result = resolver.attendanceRecords(
        '2024-01-01',
        '2024-01-03',
        'STORE-001',
        undefined,
        undefined
      );

      expect(result.every((r) => r.storeId === 'STORE-001')).toBe(true);
    });

    it('should filter by status', () => {
      resolver.approveAttendance('STORE-001', 'EMP-001', '2024-01-01');

      const result = resolver.attendanceRecords(
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
    beforeEach(() => {
      resolver.checkIn({
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });

      resolver.approveAttendance('STORE-001', 'EMP-001', '2024-01-01');

      resolver.checkIn({
        storeId: 'STORE-001',
        employeeId: 'EMP-002',
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });
    });

    it('should return only pending approvals', () => {
      const result = resolver.pendingApprovals(undefined, undefined);

      expect(result.length).toBe(1);
      expect(result[0].status).toBe(AttendanceStatus.PENDING);
      expect(result[0].employeeId).toBe('EMP-002');
    });
  });
});


