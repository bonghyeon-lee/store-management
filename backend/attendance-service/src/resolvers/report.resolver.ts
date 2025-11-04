import { Query, Resolver, Args } from '@nestjs/graphql';
import { attendanceRecords } from './attendance.resolver';

type AttendanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Attendance {
  storeId: string;
  employeeId: string;
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  workingHours?: number | null;
}

interface EmployeeAttendanceStats {
  employeeId: string;
  employeeName: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workingHours: number;
  status: AttendanceStatus;
}

interface DailyAttendanceReport {
  date: string;
  storeId: string | null;
  attendanceRate: number;
  lateCount: number;
  absentCount: number;
  employeeStats: EmployeeAttendanceStats[];
}

interface WeeklyAttendanceReport {
  weekStart: string;
  weekEnd: string;
  storeId: string | null;
  attendanceRate: number;
  averageWorkingHours: number;
  totalWorkingHours: number;
  dailyReports: DailyAttendanceReport[];
}

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

@Resolver('DailyAttendanceReport')
export class ReportResolver {
  @Query('dailyAttendanceReport')
  dailyAttendanceReport(
    @Args('storeId') storeId: string | undefined,
    @Args('date') date: string,
  ): DailyAttendanceReport {
    const records = Array.from(attendanceRecords.values());
    let filtered = records.filter((record) => record.date === date);

    if (storeId) {
      filtered = filtered.filter((record) => record.storeId === storeId);
    }

    // 출근한 직원 수
    const checkedInCount = filtered.filter(
      (record) => record.checkInAt !== null && record.checkInAt !== undefined,
    ).length;

    // 지각 건수 (예: 9시 이후 출근)
    const lateCount = filtered.filter((record) => {
      if (!record.checkInAt) return false;
      const checkInTime = new Date(record.checkInAt);
      const hour = checkInTime.getHours();
      return hour >= 9; // 9시 이후 출근을 지각으로 간주
    }).length;

    // 결근 건수 (출근 기록 없음)
    const absentCount = filtered.filter(
      (record) => record.checkInAt === null || record.checkInAt === undefined,
    ).length;

    // 출근률 계산 (출근한 직원 / 전체 직원)
    const totalEmployees = filtered.length || 1;
    const attendanceRate = checkedInCount / totalEmployees;

    // 직원별 통계
    const employeeStats: EmployeeAttendanceStats[] = filtered.map((record) => ({
      employeeId: record.employeeId,
      employeeName: `직원-${record.employeeId}`, // 실제로는 Employee 조회 필요
      checkInAt: record.checkInAt || null,
      checkOutAt: record.checkOutAt || null,
      workingHours: record.workingHours || 0,
      status: record.status,
    }));

    return {
      date,
      storeId: storeId || null,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      lateCount,
      absentCount,
      employeeStats,
    };
  }

  @Query('weeklyAttendanceReport')
  weeklyAttendanceReport(
    @Args('storeId') storeId: string | undefined,
    @Args('weekStart') weekStart: string,
  ): WeeklyAttendanceReport {
    const weekEnd = getWeekEnd(weekStart);
    const weekDates = getWeekDates(weekStart);

    const records = Array.from(attendanceRecords.values());
    let filtered = records.filter((record) =>
      weekDates.includes(record.date),
    );

    if (storeId) {
      filtered = filtered.filter((record) => record.storeId === storeId);
    }

    // 일별 리포트 생성
    const dailyReports: DailyAttendanceReport[] = weekDates.map((date) => {
      const dayRecords = filtered.filter((record) => record.date === date);

      const checkedInCount = dayRecords.filter(
        (record) => record.checkInAt !== null && record.checkInAt !== undefined,
      ).length;

      const lateCount = dayRecords.filter((record) => {
        if (!record.checkInAt) return false;
        const checkInTime = new Date(record.checkInAt);
        return checkInTime.getHours() >= 9;
      }).length;

      const absentCount = dayRecords.filter(
        (record) => record.checkInAt === null || record.checkInAt === undefined,
      ).length;

      const totalEmployees = dayRecords.length || 1;
      const attendanceRate = checkedInCount / totalEmployees;

      const employeeStats: EmployeeAttendanceStats[] = dayRecords.map(
        (record) => ({
          employeeId: record.employeeId,
          employeeName: `직원-${record.employeeId}`,
          checkInAt: record.checkInAt || null,
          checkOutAt: record.checkOutAt || null,
          workingHours: record.workingHours || 0,
          status: record.status,
        }),
      );

      return {
        date,
        storeId: storeId || null,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        lateCount,
        absentCount,
        employeeStats,
      };
    });

    // 주간 집계
    const totalWorkingHours = filtered.reduce(
      (sum, record) => sum + (record.workingHours || 0),
      0,
    );

    const checkedInDays = dailyReports.reduce(
      (sum, report) => sum + report.employeeStats.length,
      0,
    );

    const totalDays = dailyReports.length * (filtered.length / dailyReports.length || 1);
    const attendanceRate = checkedInDays / (totalDays || 1);
    const averageWorkingHours =
      checkedInDays > 0 ? totalWorkingHours / checkedInDays : 0;

    return {
      weekStart,
      weekEnd,
      storeId: storeId || null,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      averageWorkingHours: Math.round(averageWorkingHours * 100) / 100,
      totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
      dailyReports,
    };
  }
}

