import { Query, Resolver, Args, Mutation } from '@nestjs/graphql';

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

// 인메모리 데이터 저장소 (MVP 단계)
export const attendanceRecords: Map<string, Attendance> = new Map();

// 키 생성 함수
const getAttendanceKey = (storeId: string, employeeId: string, date: string) =>
  `${storeId}:${employeeId}:${date}`;

// 근무 시간 계산 함수
const calculateWorkingHours = (
  checkInAt: string | null | undefined,
  checkOutAt: string | null | undefined,
): number | null => {
  if (!checkInAt || !checkOutAt) {
    return null;
  }

  const checkIn = new Date(checkInAt);
  const checkOut = new Date(checkOutAt);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.round(diffHours * 100) / 100; // 소수점 둘째 자리까지
};

@Resolver('Attendance')
export class AttendanceResolver {
  @Query('attendance')
  attendance(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
  ): Attendance | null {
    const key = getAttendanceKey(storeId, employeeId, date);
    return attendanceRecords.get(key) || null;
  }

  @Query('attendanceRecords')
  attendanceRecords(
    @Args('storeId') storeId: string | undefined,
    @Args('employeeId') employeeId: string | undefined,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('status') status: AttendanceStatus | undefined,
  ): Attendance[] {
    const records = Array.from(attendanceRecords.values());

    let filtered = records.filter((record) => {
      const recordDate = record.date;
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (storeId) {
      filtered = filtered.filter((record) => record.storeId === storeId);
    }

    if (employeeId) {
      filtered = filtered.filter((record) => record.employeeId === employeeId);
    }

    if (status) {
      filtered = filtered.filter((record) => record.status === status);
    }

    return filtered;
  }

  @Query('pendingApprovals')
  pendingApprovals(
    @Args('storeId') storeId: string | undefined,
    @Args('managerId') managerId: string | undefined,
  ): Attendance[] {
    const records = Array.from(attendanceRecords.values());

    let filtered = records.filter((record) => record.status === 'PENDING');

    if (storeId) {
      filtered = filtered.filter((record) => record.storeId === storeId);
    }

    // managerId는 나중에 권한 체크로 확장 가능
    return filtered;
  }

  @Mutation('checkIn')
  checkIn(
    @Args('input')
    input: {
      storeId: string;
      employeeId: string;
      date: string;
      checkInAt: string;
      notes?: string;
    },
  ): Attendance {
    const key = getAttendanceKey(input.storeId, input.employeeId, input.date);

    const existing = attendanceRecords.get(key);
    if (existing) {
      // 이미 출근 기록이 있으면 업데이트
      existing.checkInAt = input.checkInAt;
      existing.notes = input.notes || null;
      existing.workingHours = calculateWorkingHours(
        existing.checkInAt,
        existing.checkOutAt,
      );
      attendanceRecords.set(key, existing);
      return existing;
    }

    // 새로운 출근 기록 생성
    const attendance: Attendance = {
      storeId: input.storeId,
      employeeId: input.employeeId,
      date: input.date,
      checkInAt: input.checkInAt,
      checkOutAt: null,
      status: 'PENDING',
      notes: input.notes || null,
      workingHours: null,
    };

    attendanceRecords.set(key, attendance);
    return attendance;
  }

  @Mutation('checkOut')
  checkOut(
    @Args('input')
    input: {
      storeId: string;
      employeeId: string;
      date: string;
      checkOutAt: string;
      notes?: string;
    },
  ): Attendance {
    const key = getAttendanceKey(input.storeId, input.employeeId, input.date);

    const existing = attendanceRecords.get(key);
    if (!existing) {
      throw new Error('출근 기록을 먼저 입력해주세요.');
    }

    existing.checkOutAt = input.checkOutAt;
    existing.notes = input.notes || existing.notes || null;
    existing.workingHours = calculateWorkingHours(
      existing.checkInAt,
      existing.checkOutAt,
    );

    attendanceRecords.set(key, existing);
    return existing;
  }

  @Mutation('approveAttendance')
  approveAttendance(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string | undefined,
  ): Attendance {
    const key = getAttendanceKey(storeId, employeeId, date);
    const attendance = attendanceRecords.get(key);

    if (!attendance) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = 'APPROVED';
    if (notes) {
      attendance.notes = notes;
    }

    attendanceRecords.set(key, attendance);
    return attendance;
  }

  @Mutation('rejectAttendance')
  rejectAttendance(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string,
  ): Attendance {
    const key = getAttendanceKey(storeId, employeeId, date);
    const attendance = attendanceRecords.get(key);

    if (!attendance) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = 'REJECTED';
    attendance.notes = notes;

    attendanceRecords.set(key, attendance);
    return attendance;
  }

  @Mutation('requestAttendanceCorrection')
  requestAttendanceCorrection(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string,
  ): Attendance {
    const key = getAttendanceKey(storeId, employeeId, date);
    const attendance = attendanceRecords.get(key);

    if (!attendance) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = 'PENDING';
    attendance.notes = notes;

    attendanceRecords.set(key, attendance);
    return attendance;
  }
}
