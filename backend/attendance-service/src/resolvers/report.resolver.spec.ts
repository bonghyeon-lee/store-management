import { Test, TestingModule } from '@nestjs/testing';
import { ReportResolver } from './report.resolver';
import { AttendanceResolver } from './attendance.resolver';
import { EmployeeResolver } from './employee.resolver';
import { AttendanceStatus } from '../models/attendance.model';
import { CheckInInput, CheckOutInput } from '../models/inputs.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceEntity } from '../entities/attendance.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import {
  createMockRepository,
  createMockQueryBuilder,
  setupQueryBuilderMock,
} from '../test-utils/typeorm-mock';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EmploymentStatus } from '../models/employee.model';

describe('ReportResolver', () => {
  let resolver: ReportResolver;
  let mockAttendanceRepository: Repository<AttendanceEntity>;
  let mockEmployeeRepository: Repository<EmployeeEntity>;
  let mockAttendanceQueryBuilder: SelectQueryBuilder<AttendanceEntity>;
  let mockEmployeeQueryBuilder: SelectQueryBuilder<EmployeeEntity>;

  beforeEach(async () => {
    mockAttendanceRepository = createMockRepository<AttendanceEntity>();
    mockEmployeeRepository = createMockRepository<EmployeeEntity>();
    mockAttendanceQueryBuilder = createMockQueryBuilder<AttendanceEntity>();
    mockEmployeeQueryBuilder = createMockQueryBuilder<EmployeeEntity>();
    setupQueryBuilderMock(mockAttendanceRepository, mockAttendanceQueryBuilder);
    setupQueryBuilderMock(mockEmployeeRepository, mockEmployeeQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportResolver,
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: mockAttendanceRepository,
        },
        {
          provide: getRepositoryToken(EmployeeEntity),
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    resolver = module.get<ReportResolver>(ReportResolver);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('dailyAttendanceReport', () => {
    it('should generate daily report with correct statistics', async () => {
      const date = '2024-01-01';
      const storeId = 'STORE-001';

      const mockAttendanceRecords = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          checkOutAt: new Date('2024-01-01T18:00:00'),
          workingHours: 9,
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-002',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T08:30:00'),
          checkOutAt: new Date('2024-01-01T17:30:00'),
          workingHours: 9,
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      const mockEmployees = [
        {
          id: 'EMP-001',
          name: '홍길동',
          role: 'EMPLOYEE',
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

      (mockAttendanceQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockAttendanceRecords,
      );
      (mockEmployeeRepository.find as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await resolver.dailyAttendanceReport(date, storeId);

      expect(result.date).toBe(date);
      expect(result.storeId).toBe(storeId);
      expect(result.attendanceRate).toBeGreaterThan(0);
      expect(result.employeeStats.length).toBe(2);
      expect(result.employeeStats[0].employeeName).toBe('홍길동');
      expect(result.employeeStats[1].employeeName).toBe('김철수');
      expect(mockAttendanceQueryBuilder.where).toHaveBeenCalledWith(
        'attendance.date = :date',
        { date },
      );
      expect(mockAttendanceQueryBuilder.andWhere).toHaveBeenCalledWith(
        'attendance.storeId = :storeId',
        { storeId },
      );
    });

    it('should calculate late count correctly', async () => {
      const date = '2024-01-01';
      const storeId = 'STORE-001';

      const mockAttendanceRecords = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:30:00'), // 지각
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-002',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T08:30:00'), // 정상
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      const mockEmployees = [
        {
          id: 'EMP-001',
          name: '홍길동',
        },
        {
          id: 'EMP-002',
          name: '김철수',
        },
      ] as EmployeeEntity[];

      (mockAttendanceQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockAttendanceRecords,
      );
      (mockEmployeeRepository.find as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await resolver.dailyAttendanceReport(date, storeId);

      expect(result.lateCount).toBe(1);
    });

    it('should calculate absent count correctly', async () => {
      const date = '2024-01-01';
      const storeId = 'STORE-001';

      const mockAttendanceRecords = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: null, // 결근
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-002',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      const mockEmployees = [
        {
          id: 'EMP-001',
          name: '홍길동',
        },
        {
          id: 'EMP-002',
          name: '김철수',
        },
      ] as EmployeeEntity[];

      (mockAttendanceQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockAttendanceRecords,
      );
      (mockEmployeeRepository.find as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await resolver.dailyAttendanceReport(date, storeId);

      expect(result.absentCount).toBe(1);
    });
  });

  describe('weeklyAttendanceReport', () => {
    it('should generate weekly report', async () => {
      const weekStart = '2024-01-01'; // 월요일

      const mockAttendanceRecords = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          checkOutAt: new Date('2024-01-01T18:00:00'),
          workingHours: 9,
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-02',
          checkInAt: new Date('2024-01-02T09:00:00'),
          checkOutAt: new Date('2024-01-02T18:00:00'),
          workingHours: 9,
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      const mockEmployees = [
        {
          id: 'EMP-001',
          name: '홍길동',
        },
      ] as EmployeeEntity[];

      (mockAttendanceQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockAttendanceRecords,
      );
      (mockEmployeeRepository.find as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await resolver.weeklyAttendanceReport(weekStart, 'STORE-001');

      expect(result.weekStart).toBe(weekStart);
      expect(result.storeId).toBe('STORE-001');
      expect(result.dailyReports.length).toBe(7); // 일주일
      expect(result.totalWorkingHours).toBeGreaterThan(0);
      expect(result.averageWorkingHours).toBeGreaterThan(0);
    });

    it('should calculate weekly attendance rate', async () => {
      const weekStart = '2024-01-01';

      const mockAttendanceRecords = [
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: new Date('2024-01-01T09:00:00'),
          workingHours: 8,
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-02',
          checkInAt: new Date('2024-01-02T09:00:00'),
          workingHours: 8,
          status: AttendanceStatus.PENDING,
        },
        {
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: '2024-01-03',
          checkInAt: new Date('2024-01-03T09:00:00'),
          workingHours: 8,
          status: AttendanceStatus.PENDING,
        },
      ] as AttendanceEntity[];

      const mockEmployees = [
        {
          id: 'EMP-001',
          name: '홍길동',
        },
      ] as EmployeeEntity[];

      (mockAttendanceQueryBuilder.where as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.andWhere as jest.Mock).mockReturnThis();
      (mockAttendanceQueryBuilder.getMany as jest.Mock).mockResolvedValue(
        mockAttendanceRecords,
      );
      (mockEmployeeRepository.find as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await resolver.weeklyAttendanceReport(weekStart, 'STORE-001');

      expect(result.attendanceRate).toBeGreaterThan(0);
      expect(result.attendanceRate).toBeLessThanOrEqual(1);
    });
  });
});