// @ts-nocheck
// TODO: TypeORM Mock을 사용하여 테스트 재작성 예정
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { EmployeeResolver } from './employee.resolver';
import { AttendanceResolver } from './attendance.resolver';
import { ReportResolver } from './report.resolver';
import { EmploymentStatus } from '../models/employee.model';
import { AttendanceStatus } from '../models/attendance.model';
import { getRepositoryToken } from '@nestjs/typeorm';
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

describe('Attendance Service Integration Tests', () => {
  let employeeResolver: EmployeeResolver;
  let attendanceResolver: AttendanceResolver;
  let reportResolver: ReportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
          driver: ApolloFederationDriver,
          autoSchemaFile: true,
          sortSchema: true,
        }),
      ],
      providers: [
        EmployeeResolver,
        AttendanceResolver,
        ReportResolver,
        {
          provide: getRepositoryToken(EmployeeEntity),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: mockAttendanceRepository,
        },
      ],
    }).compile();

    employeeResolver = module.get<EmployeeResolver>(EmployeeResolver);
    attendanceResolver = module.get<AttendanceResolver>(AttendanceResolver);
    reportResolver = module.get<ReportResolver>(ReportResolver);

    // Mock 초기화
    jest.clearAllMocks();
  });

  describe('Complete Employee and Attendance Workflow', () => {
    it('should create employee, record attendance, and generate report', () => {
      // 1. 직원 생성
      const employee = employeeResolver.createEmployee({
        name: '테스트 직원',
        email: 'test@example.com',
        phone: '010-1234-5678',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      expect(employee).toBeDefined();
      expect(employee.id).toBeDefined();

      // 2. 출근 기록
      const checkInResult = attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: employee.id,
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
        notes: '정상 출근',
      });

      expect(checkInResult.status).toBe(AttendanceStatus.PENDING);
      expect(checkInResult.checkInAt).toBe('2024-01-01T09:00:00');

      // 3. 퇴근 기록
      const checkOutResult = attendanceResolver.checkOut({
        storeId: 'STORE-001',
        employeeId: employee.id,
        date: '2024-01-01',
        checkOutAt: '2024-01-01T18:00:00',
        notes: '정상 퇴근',
      });

      expect(checkOutResult.checkOutAt).toBe('2024-01-01T18:00:00');
      expect(checkOutResult.workingHours).toBe(9);

      // 4. 근태 승인
      const approvedResult = attendanceResolver.approveAttendance(
        'STORE-001',
        employee.id,
        '2024-01-01',
        '승인 완료'
      );

      expect(approvedResult.status).toBe(AttendanceStatus.APPROVED);

      // 5. 리포트 생성
      const report = reportResolver.dailyAttendanceReport('2024-01-01', 'STORE-001');

      expect(report).toBeDefined();
      expect(report.date).toBe('2024-01-01');
      expect(report.employeeStats.length).toBeGreaterThan(0);
      expect(report.employeeStats[0].employeeName).toBe('테스트 직원');
    });

    it('should handle multiple employees and attendance records', () => {
      // 여러 직원 생성
      const emp1 = employeeResolver.createEmployee({
        name: '직원1',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      const emp2 = employeeResolver.createEmployee({
        name: '직원2',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      // 여러 날짜의 출근 기록
      const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
      dates.forEach((date) => {
        attendanceResolver.checkIn({
          storeId: 'STORE-001',
          employeeId: emp1.id,
          date,
          checkInAt: `${date}T09:00:00`,
        });

        attendanceResolver.checkIn({
          storeId: 'STORE-001',
          employeeId: emp2.id,
          date,
          checkInAt: `${date}T09:00:00`,
        });
      });

      // 출근 기록 목록 조회
      const records = attendanceResolver.attendanceRecords(
        '2024-01-01',
        '2024-01-03',
        'STORE-001',
        undefined,
        undefined
      );

      expect(records.length).toBe(6); // 2명 * 3일

      // 주간 리포트 생성
      const weeklyReport = reportResolver.weeklyAttendanceReport('2024-01-01', 'STORE-001');

      expect(weeklyReport.dailyReports.length).toBe(7);
      expect(weeklyReport.attendanceRate).toBeGreaterThan(0);
    });

    it('should handle approval workflow', () => {
      const employee = employeeResolver.createEmployee({
        name: '승인 테스트',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      // 출퇴근 기록
      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: employee.id,
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });

      attendanceResolver.checkOut({
        storeId: 'STORE-001',
        employeeId: employee.id,
        date: '2024-01-01',
        checkOutAt: '2024-01-01T18:00:00',
      });

      // 승인 대기 목록 조회
      const pending = attendanceResolver.pendingApprovals('STORE-001', undefined);
      expect(pending.length).toBe(1);
      expect(pending[0].status).toBe(AttendanceStatus.PENDING);

      // 승인
      attendanceResolver.approveAttendance('STORE-001', employee.id, '2024-01-01');

      // 승인 대기 목록이 비어있는지 확인
      const pendingAfter = attendanceResolver.pendingApprovals('STORE-001', undefined);
      expect(pendingAfter.length).toBe(0);

      // 승인된 기록 조회
      const approvedRecords = attendanceResolver.attendanceRecords(
        '2024-01-01',
        '2024-01-01',
        undefined,
        undefined,
        AttendanceStatus.APPROVED
      );

      expect(approvedRecords.length).toBe(1);
      expect(approvedRecords[0].status).toBe(AttendanceStatus.APPROVED);
    });

    it('should handle rejection and correction request', () => {
      const employee = employeeResolver.createEmployee({
        name: '거부 테스트',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      // 출퇴근 기록
      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: employee.id,
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });

      // 거부
      const rejected = attendanceResolver.rejectAttendance(
        'STORE-001',
        employee.id,
        '2024-01-01',
        '기록 오류'
      );

      expect(rejected.status).toBe(AttendanceStatus.REJECTED);
      expect(rejected.notes).toBe('기록 오류');

      // 수정 요청
      const corrected = attendanceResolver.requestAttendanceCorrection(
        'STORE-001',
        employee.id,
        '2024-01-01',
        '수정 요청'
      );

      expect(corrected.status).toBe(AttendanceStatus.PENDING);
      expect(corrected.notes).toBe('수정 요청');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid inputs across resolvers', () => {
      // 잘못된 직원 생성
      expect(() => {
        employeeResolver.createEmployee({
          name: '',
          role: 'EMPLOYEE',
          assignedStoreIds: ['STORE-001'],
        });
      }).toThrow();

      // 잘못된 출근 기록
      expect(() => {
        attendanceResolver.checkIn({
          storeId: '',
          employeeId: 'EMP-001',
          date: '2024-01-01',
          checkInAt: '2024-01-01T09:00:00',
        });
      }).toThrow();

      // 존재하지 않는 직원의 출근 기록 조회
      const result = employeeResolver.employee('NON-EXISTENT');
      expect(result).toBeNull();
    });
  });
});


