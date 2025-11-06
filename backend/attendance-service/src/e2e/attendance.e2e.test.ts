import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResolver } from '../resolvers/employee.resolver';
import { AttendanceResolver } from '../resolvers/attendance.resolver';
import { ReportResolver } from '../resolvers/report.resolver';
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
import { EmploymentStatus } from '../models/employee.model';
import { AttendanceStatus } from '../models/attendance.model';

describe('Attendance Service E2E Tests', () => {
  let employeeResolver: EmployeeResolver;
  let attendanceResolver: AttendanceResolver;
  let reportResolver: ReportResolver;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    employeeResolver = moduleFixture.get<EmployeeResolver>(EmployeeResolver);
    attendanceResolver = moduleFixture.get<AttendanceResolver>(AttendanceResolver);
    reportResolver = moduleFixture.get<ReportResolver>(ReportResolver);
  });

  beforeEach(() => {
    // Mock 초기화
    jest.clearAllMocks();
  });

  describe('Complete E2E Workflow', () => {
    it('should complete full attendance workflow from employee creation to report generation', () => {
      // Step 1: 직원 생성
      const employee1 = employeeResolver.createEmployee({
        name: '김철수',
        email: 'kim@example.com',
        phone: '010-1234-5678',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      const employee2 = employeeResolver.createEmployee({
        name: '이영희',
        email: 'lee@example.com',
        phone: '010-2345-6789',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      expect(employee1.employmentStatus).toBe(EmploymentStatus.ACTIVE);
      expect(employee2.employmentStatus).toBe(EmploymentStatus.ACTIVE);

      // Step 2: 일주일간 출퇴근 기록 생성
      const dates = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'];
      dates.forEach((date) => {
        // 직원1 출퇴근
        attendanceResolver.checkIn({
          storeId: 'STORE-001',
          employeeId: employee1.id,
          date,
          checkInAt: `${date}T09:00:00`,
        });

        attendanceResolver.checkOut({
          storeId: 'STORE-001',
          employeeId: employee1.id,
          date,
          checkOutAt: `${date}T18:00:00`,
        });

        // 직원2 출퇴근 (지각: 9시 30분)
        attendanceResolver.checkIn({
          storeId: 'STORE-001',
          employeeId: employee2.id,
          date,
          checkInAt: `${date}T09:30:00`,
        });

        attendanceResolver.checkOut({
          storeId: 'STORE-001',
          employeeId: employee2.id,
          date,
          checkOutAt: `${date}T18:00:00`,
        });
      });

      // Step 3: 승인 대기 목록 확인
      const pendingList = attendanceResolver.pendingApprovals('STORE-001', undefined);
      expect(pendingList.length).toBe(10); // 2명 * 5일

      // Step 4: 근태 승인
      dates.forEach((date) => {
        attendanceResolver.approveAttendance(
          'STORE-001',
          employee1.id,
          date,
          '승인 완료'
        );
        attendanceResolver.approveAttendance(
          'STORE-001',
          employee2.id,
          date,
          '승인 완료'
        );
      });

      // Step 5: 승인 후 대기 목록 확인
      const pendingAfterApproval = attendanceResolver.pendingApprovals('STORE-001', undefined);
      expect(pendingAfterApproval.length).toBe(0);

      // Step 6: 일별 리포트 생성
      const dailyReport = reportResolver.dailyAttendanceReport('2024-01-01', 'STORE-001');
      expect(dailyReport.attendanceRate).toBeGreaterThan(0);
      expect(dailyReport.lateCount).toBe(2); // 직원2가 지각
      expect(dailyReport.employeeStats.length).toBe(2);
      expect(dailyReport.employeeStats[0].employeeName).toBe('김철수');
      expect(dailyReport.employeeStats[1].employeeName).toBe('이영희');

      // Step 7: 주간 리포트 생성
      const weeklyReport = reportResolver.weeklyAttendanceReport('2024-01-01', 'STORE-001');
      expect(weeklyReport.dailyReports.length).toBe(7);
      expect(weeklyReport.totalWorkingHours).toBeGreaterThan(0);
      expect(weeklyReport.averageWorkingHours).toBeGreaterThan(0);

      // Step 8: 출퇴근 기록 조회
      const records = attendanceResolver.attendanceRecords(
        '2024-01-01',
        '2024-01-05',
        'STORE-001',
        employee1.id,
        AttendanceStatus.APPROVED
      );
      expect(records.length).toBe(5);
      expect(records.every((r) => r.status === AttendanceStatus.APPROVED)).toBe(true);

      // Step 9: 직원 정보 수정
      const updatedEmployee = employeeResolver.updateEmployee(employee1.id, {
        name: '김철수 (수정)',
        email: 'kim-updated@example.com',
      });
      expect(updatedEmployee.name).toBe('김철수 (수정)');
      expect(updatedEmployee.email).toBe('kim-updated@example.com');

      // Step 10: 직원 비활성화
      const deleted = employeeResolver.deleteEmployee(employee1.id);
      expect(deleted).toBe(true);
      const inactiveEmployee = employeeResolver.employee(employee1.id);
      expect(inactiveEmployee?.employmentStatus).toBe(EmploymentStatus.INACTIVE);
    });

    it('should handle rejection and correction workflow', () => {
      // 직원 생성
      const employee = employeeResolver.createEmployee({
        name: '수정 테스트',
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

      // 거부
      const rejected = attendanceResolver.rejectAttendance(
        'STORE-001',
        employee.id,
        '2024-01-01',
        '기록 오류로 거부'
      );
      expect(rejected.status).toBe(AttendanceStatus.REJECTED);

      // 거부된 기록 조회
      const rejectedRecords = attendanceResolver.attendanceRecords(
        '2024-01-01',
        '2024-01-01',
        undefined,
        undefined,
        AttendanceStatus.REJECTED
      );
      expect(rejectedRecords.length).toBe(1);

      // 수정 요청
      const corrected = attendanceResolver.requestAttendanceCorrection(
        'STORE-001',
        employee.id,
        '2024-01-01',
        '정정 요청'
      );
      expect(corrected.status).toBe(AttendanceStatus.PENDING);

      // 다시 승인
      const approved = attendanceResolver.approveAttendance(
        'STORE-001',
        employee.id,
        '2024-01-01',
        '정정 후 승인'
      );
      expect(approved.status).toBe(AttendanceStatus.APPROVED);
    });

    it('should handle multiple stores and employees', () => {
      // 여러 지점의 직원 생성
      const emp1 = employeeResolver.createEmployee({
        name: '지점1 직원',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-001'],
      });

      const emp2 = employeeResolver.createEmployee({
        name: '지점2 직원',
        role: 'EMPLOYEE',
        assignedStoreIds: ['STORE-002'],
      });

      // 각 지점별 출근 기록
      attendanceResolver.checkIn({
        storeId: 'STORE-001',
        employeeId: emp1.id,
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });

      attendanceResolver.checkIn({
        storeId: 'STORE-002',
        employeeId: emp2.id,
        date: '2024-01-01',
        checkInAt: '2024-01-01T09:00:00',
      });

      // 지점별 리포트 생성
      const report1 = reportResolver.dailyAttendanceReport('2024-01-01', 'STORE-001');
      const report2 = reportResolver.dailyAttendanceReport('2024-01-01', 'STORE-002');

      expect(report1.employeeStats.length).toBe(1);
      expect(report2.employeeStats.length).toBe(1);
      expect(report1.storeId).toBe('STORE-001');
      expect(report2.storeId).toBe('STORE-002');

      // 지점별 필터링된 출근 기록 조회
      const records1 = attendanceResolver.attendanceRecords(
        '2024-01-01',
        '2024-01-01',
        'STORE-001',
        undefined,
        undefined
      );
      const records2 = attendanceResolver.attendanceRecords(
        '2024-01-01',
        '2024-01-01',
        'STORE-002',
        undefined,
        undefined
      );

      expect(records1.length).toBe(1);
      expect(records2.length).toBe(1);
      expect(records1[0].storeId).toBe('STORE-001');
      expect(records2[0].storeId).toBe('STORE-002');
    });
  });
});

