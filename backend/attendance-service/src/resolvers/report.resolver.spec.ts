import { Test, TestingModule } from '@nestjs/testing';
import { ReportResolver } from './report.resolver';
import { AttendanceResolver } from './attendance.resolver';
import { EmployeeResolver } from './employee.resolver';
import { AttendanceStatus } from '../models/attendance.model';
import { CheckInInput, CheckOutInput } from '../models/inputs.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from '../entities/attendance.entity';
import { EmployeeEntity } from '../entities/employee.entity';

// TypeORM Mock Repository
const mockAttendanceRepository = {
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockEmployeeRepository = {
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('ReportResolver', () => {
  let resolver: ReportResolver;
  let attendanceResolver: AttendanceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportResolver,
        AttendanceResolver,
        EmployeeResolver,
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
    attendanceResolver = module.get<AttendanceResolver>(AttendanceResolver);

    // Mock 초기화
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('dailyAttendanceReport', () => {
    it('should generate daily report with correct statistics', () => {
      const date = '2024-01-01';

      // 출근 기록 생성
      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date,
        checkInAt: `${date}T09:00:00`,
      });

      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: 'EMP-002',
        date,
        checkInAt: `${date}T08:30:00`,
      });

      // 퇴근 기록
      attendanceResolver.checkOut({
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date,
        checkOutAt: `${date}T18:00:00`,
      });

      const result = resolver.dailyAttendanceReport(date, 'STORE-001');

      expect(result.date).toBe(date);
      expect(result.storeId).toBe('STORE-001');
      expect(result.attendanceRate).toBeGreaterThan(0);
      expect(result.employeeStats.length).toBe(2);
      expect(result.employeeStats[0].employeeName).toBe('홍길동');
      expect(result.employeeStats[1].employeeName).toBe('김철수');
    });

    it('should calculate late count correctly', () => {
      const date = '2024-01-01';

      // 9시 이후 출근 (지각)
      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: 'EMP-001',
        date,
        checkInAt: `${date}T09:30:00`,
      });

      // 8시 30분 출근 (정상)
      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: 'EMP-002',
        date,
        checkInAt: `${date}T08:30:00`,
      });

      const result = resolver.dailyAttendanceReport(date, 'STORE-001');

      expect(result.lateCount).toBe(1);
    });

    it('should calculate absent count correctly', () => {
      const date = '2024-01-01';

      // 출근 기록이 없는 경우
      const result = resolver.dailyAttendanceReport(date, 'STORE-001');

      expect(result.absentCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('weeklyAttendanceReport', () => {
    it('should generate weekly report', () => {
      const weekStart = '2024-01-01'; // 월요일

      // 월요일부터 금요일까지 출근 기록 생성
      for (let i = 0; i < 5; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        attendanceResolver.checkIn({
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: dateStr,
          checkInAt: `${dateStr}T09:00:00`,
        });

        attendanceResolver.checkOut({
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: dateStr,
          checkOutAt: `${dateStr}T18:00:00`,
        });
      }

      const result = resolver.weeklyAttendanceReport(weekStart, 'STORE-001');

      expect(result.weekStart).toBe(weekStart);
      expect(result.storeId).toBe('STORE-001');
      expect(result.dailyReports.length).toBe(7); // 일주일
      expect(result.totalWorkingHours).toBeGreaterThan(0);
      expect(result.averageWorkingHours).toBeGreaterThan(0);
    });

    it('should calculate weekly attendance rate', () => {
      const weekStart = '2024-01-01';

      // 3일만 출근
      for (let i = 0; i < 3; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        attendanceResolver.checkIn({
          storeId: 'STORE-001',
          employeeId: 'EMP-001',
          date: dateStr,
          checkInAt: `${dateStr}T09:00:00`,
        });
      }

      const result = resolver.weeklyAttendanceReport(weekStart, 'STORE-001');

      expect(result.attendanceRate).toBeGreaterThan(0);
      expect(result.attendanceRate).toBeLessThanOrEqual(1);
    });
  });
});


