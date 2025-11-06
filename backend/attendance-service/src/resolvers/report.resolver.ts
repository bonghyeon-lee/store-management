import { Query, Resolver, Args, ID } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from '../entities/attendance.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import {
  DailyAttendanceReport,
  WeeklyAttendanceReport,
} from '../models/report.model';
import { AttendanceStatus } from '../models/attendance.model';

// 주 시작일 계산 (월요일 기준)
const getWeekStart = (date: string): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일 기준
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// 주 종료일 계산 (일요일)
const getWeekEnd = (date: string): string => {
  const weekStart = getWeekStart(date);
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
};

// 일주일의 모든 날짜 반환
const getWeekDates = (weekStart: string): string[] => {
  const dates: string[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

@Resolver(() => DailyAttendanceReport)
export class ReportResolver {
  constructor(
    @InjectRepository(AttendanceEntity)
    private attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>
  ) {}

  @Query(() => DailyAttendanceReport, { description: '일별 근태 리포트' })
  async dailyAttendanceReport(
    @Args('date') date: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string
  ): Promise<DailyAttendanceReport> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.date = :date', { date });

    if (storeId) {
      queryBuilder.andWhere('attendance.storeId = :storeId', { storeId });
    }

    const records = await queryBuilder.getMany();

    // 출근한 직원 수
    const checkedInCount = records.filter(
      (record) => record.checkInAt !== null && record.checkInAt !== undefined
    ).length;

    // 지각 건수 (예: 9시 이후 출근)
    const lateCount = records.filter((record) => {
      if (!record.checkInAt) return false;
      const hour = record.checkInAt.getHours();
      return hour >= 9; // 9시 이후 출근을 지각으로 간주
    }).length;

    // 결근 건수 (출근 기록 없음)
    const absentCount = records.filter(
      (record) => record.checkInAt === null || record.checkInAt === undefined
    ).length;

    // 출근률 계산 (출근한 직원 / 전체 직원)
    const totalEmployees = records.length || 1;
    const attendanceRate = checkedInCount / totalEmployees;

    // 직원 정보 조회
    const employeeIds = [...new Set(records.map((r) => r.employeeId))];
    const employees = await this.employeeRepository.find({
      where: employeeIds.map((id) => ({ id })),
    });
    const employeeMap = new Map(employees.map((e) => [e.id, e]));

    // 직원별 통계
    const employeeStats = records.map((record) => {
      const employee = employeeMap.get(record.employeeId);
      return {
        employeeId: record.employeeId,
        employeeName: employee?.name || `직원-${record.employeeId}`,
        checkInAt: record.checkInAt?.toISOString(),
        checkOutAt: record.checkOutAt?.toISOString(),
        workingHours: record.workingHours ? Number(record.workingHours) : 0,
        status: record.status,
      };
    });

    return {
      date,
      storeId,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      lateCount,
      absentCount,
      employeeStats,
    };
  }

  @Query(() => WeeklyAttendanceReport, { description: '주별 근태 리포트' })
  async weeklyAttendanceReport(
    @Args('weekStart') weekStart: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string
  ): Promise<WeeklyAttendanceReport> {
    const weekEnd = getWeekEnd(weekStart);
    const weekDates = getWeekDates(weekStart);

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.date IN (:...weekDates)', { weekDates });

    if (storeId) {
      queryBuilder.andWhere('attendance.storeId = :storeId', { storeId });
    }

    const records = await queryBuilder.getMany();

    // 일별 리포트 생성
    const dailyReports: DailyAttendanceReport[] = await Promise.all(
      weekDates.map(async (date) => {
        const dayRecords = records.filter((record) => record.date === date);

        const checkedInCount = dayRecords.filter(
          (record) =>
            record.checkInAt !== null && record.checkInAt !== undefined
        ).length;

        const lateCount = dayRecords.filter((record) => {
          if (!record.checkInAt) return false;
          const checkInTime = new Date(record.checkInAt);
          return checkInTime.getHours() >= 9;
        }).length;

        const absentCount = dayRecords.filter(
          (record) =>
            record.checkInAt === null || record.checkInAt === undefined
        ).length;

        const totalEmployees = dayRecords.length || 1;
        const attendanceRate = checkedInCount / totalEmployees;

        const dayEmployeeIds = [
          ...new Set(dayRecords.map((r) => r.employeeId)),
        ];
        const dayEmployees = await this.employeeRepository.find({
          where: dayEmployeeIds.map((id) => ({ id })),
        });
        const dayEmployeeMap = new Map(dayEmployees.map((e) => [e.id, e]));

        const employeeStats = dayRecords.map((record) => {
          const employee = dayEmployeeMap.get(record.employeeId);
          return {
            employeeId: record.employeeId,
            employeeName: employee?.name || `직원-${record.employeeId}`,
            checkInAt: record.checkInAt?.toISOString(),
            checkOutAt: record.checkOutAt?.toISOString(),
            workingHours: record.workingHours ? Number(record.workingHours) : 0,
            status: record.status,
          };
        });

        return {
          date,
          storeId,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          lateCount,
          absentCount,
          employeeStats,
        };
      })
    );

    // 주간 집계
    const totalWorkingHours = records.reduce(
      (sum, record) =>
        sum + (record.workingHours ? Number(record.workingHours) : 0),
      0
    );

    const checkedInDays = dailyReports.reduce(
      (sum, report) => sum + report.employeeStats.length,
      0
    );

    const totalDays =
      dailyReports.length * (records.length / dailyReports.length || 1);
    const attendanceRate = checkedInDays / (totalDays || 1);
    const averageWorkingHours =
      checkedInDays > 0 ? totalWorkingHours / checkedInDays : 0;

    return {
      weekStart,
      weekEnd,
      storeId,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      averageWorkingHours: Math.round(averageWorkingHours * 100) / 100,
      totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
      dailyReports,
    };
  }
}
