import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { Attendance, AttendanceStatus } from '../models/attendance.model';
import { CheckInInput, CheckOutInput } from '../models/inputs.model';

// 인메모리 데이터 저장소 (MVP 단계)
export const attendanceRecords: Map<string, Attendance> = new Map();

// 키 생성 함수
const getAttendanceKey = (storeId: string, employeeId: string, date: string) =>
  `${storeId}:${employeeId}:${date}`;

// 근무 시간 계산 함수
const calculateWorkingHours = (
  checkInAt: string | null | undefined,
  checkOutAt: string | null | undefined
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

@Resolver(() => Attendance)
export class AttendanceResolver {
  @Query(() => Attendance, { nullable: true, description: '출퇴근 기록 조회' })
  attendance(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string
  ): Attendance | null {
    const key = getAttendanceKey(storeId, employeeId, date);
    return attendanceRecords.get(key) || null;
  }

  @Query(() => [Attendance], { description: '출퇴근 기록 목록 조회' })
  attendanceRecords(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('status', { type: () => AttendanceStatus, nullable: true })
    status?: AttendanceStatus
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

  @Query(() => [Attendance], { description: '승인 대기 목록 조회' })
  pendingApprovals(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('managerId', { type: () => ID, nullable: true }) managerId?: string
  ): Attendance[] {
    const records = Array.from(attendanceRecords.values());

    let filtered = records.filter(
      (record) => record.status === AttendanceStatus.PENDING
    );

    if (storeId) {
      filtered = filtered.filter((record) => record.storeId === storeId);
    }

    // managerId는 나중에 권한 체크로 확장 가능
    return filtered;
  }

  @Mutation(() => Attendance, { description: '출근 기록' })
  checkIn(@Args('input') input: CheckInInput): Attendance {
    // 입력 값 검증
    if (!input.storeId || input.storeId.trim().length === 0) {
      throw new Error('지점 ID는 필수 입력 항목입니다.');
    }

    if (!input.employeeId || input.employeeId.trim().length === 0) {
      throw new Error('직원 ID는 필수 입력 항목입니다.');
    }

    if (!input.date || input.date.trim().length === 0) {
      throw new Error('날짜는 필수 입력 항목입니다.');
    }

    if (!input.checkInAt || input.checkInAt.trim().length === 0) {
      throw new Error('출근 시간은 필수 입력 항목입니다.');
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.date)) {
      throw new Error('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식 필요)');
    }

    // 출근 시간 형식 검증 (ISO-8601)
    try {
      const checkInDate = new Date(input.checkInAt);
      if (isNaN(checkInDate.getTime())) {
        throw new Error('출근 시간 형식이 올바르지 않습니다.');
      }
    } catch {
      throw new Error('출근 시간 형식이 올바르지 않습니다.');
    }

    const key = getAttendanceKey(input.storeId, input.employeeId, input.date);

    const existing = attendanceRecords.get(key);
    if (existing) {
      // 이미 출근 기록이 있으면 업데이트
      existing.checkInAt = input.checkInAt;
      existing.notes = input.notes;
      existing.workingHours =
        calculateWorkingHours(existing.checkInAt, existing.checkOutAt) ||
        undefined;
      attendanceRecords.set(key, existing);
      return existing;
    }

    // 새로운 출근 기록 생성
    const attendance: Attendance = {
      storeId: input.storeId,
      employeeId: input.employeeId,
      date: input.date,
      checkInAt: input.checkInAt,
      checkOutAt: undefined,
      status: AttendanceStatus.PENDING,
      notes: input.notes,
      workingHours: undefined,
    };

    attendanceRecords.set(key, attendance);
    return attendance;
  }

  @Mutation(() => Attendance, { description: '퇴근 기록' })
  checkOut(@Args('input') input: CheckOutInput): Attendance {
    // 입력 값 검증
    if (!input.storeId || input.storeId.trim().length === 0) {
      throw new Error('지점 ID는 필수 입력 항목입니다.');
    }

    if (!input.employeeId || input.employeeId.trim().length === 0) {
      throw new Error('직원 ID는 필수 입력 항목입니다.');
    }

    if (!input.date || input.date.trim().length === 0) {
      throw new Error('날짜는 필수 입력 항목입니다.');
    }

    if (!input.checkOutAt || input.checkOutAt.trim().length === 0) {
      throw new Error('퇴근 시간은 필수 입력 항목입니다.');
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.date)) {
      throw new Error('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식 필요)');
    }

    // 퇴근 시간 형식 검증 (ISO-8601)
    try {
      const checkOutDate = new Date(input.checkOutAt);
      if (isNaN(checkOutDate.getTime())) {
        throw new Error('퇴근 시간 형식이 올바르지 않습니다.');
      }
    } catch {
      throw new Error('퇴근 시간 형식이 올바르지 않습니다.');
    }

    const key = getAttendanceKey(input.storeId, input.employeeId, input.date);

    const existing = attendanceRecords.get(key);
    if (!existing) {
      throw new Error('출근 기록을 먼저 입력해주세요.');
    }

    // 출근 시간보다 퇴근 시간이 빠른지 확인
    if (existing.checkInAt) {
      const checkInTime = new Date(existing.checkInAt);
      const checkOutTime = new Date(input.checkOutAt);
      if (checkOutTime <= checkInTime) {
        throw new Error('퇴근 시간은 출근 시간보다 늦어야 합니다.');
      }
    }

    existing.checkOutAt = input.checkOutAt;
    existing.notes = input.notes || existing.notes;
    existing.workingHours =
      calculateWorkingHours(existing.checkInAt, existing.checkOutAt) ||
      undefined;

    attendanceRecords.set(key, existing);
    return existing;
  }

  @Mutation(() => Attendance, { description: '근태 승인' })
  approveAttendance(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string,
    @Args('notes', { nullable: true }) notes?: string
  ): Attendance {
    // 입력 값 검증
    if (!storeId || storeId.trim().length === 0) {
      throw new Error('지점 ID는 필수 입력 항목입니다.');
    }

    if (!employeeId || employeeId.trim().length === 0) {
      throw new Error('직원 ID는 필수 입력 항목입니다.');
    }

    if (!date || date.trim().length === 0) {
      throw new Error('날짜는 필수 입력 항목입니다.');
    }

    const key = getAttendanceKey(storeId, employeeId, date);
    const attendance = attendanceRecords.get(key);

    if (!attendance) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    // 이미 승인된 경우
    if (attendance.status === AttendanceStatus.APPROVED) {
      throw new Error('이미 승인된 근태 기록입니다.');
    }

    attendance.status = AttendanceStatus.APPROVED;
    if (notes) {
      attendance.notes = notes;
    }

    attendanceRecords.set(key, attendance);
    return attendance;
  }

  @Mutation(() => Attendance, { description: '근태 거부' })
  rejectAttendance(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string
  ): Attendance {
    // 입력 값 검증
    if (!storeId || storeId.trim().length === 0) {
      throw new Error('지점 ID는 필수 입력 항목입니다.');
    }

    if (!employeeId || employeeId.trim().length === 0) {
      throw new Error('직원 ID는 필수 입력 항목입니다.');
    }

    if (!date || date.trim().length === 0) {
      throw new Error('날짜는 필수 입력 항목입니다.');
    }

    if (!notes || notes.trim().length === 0) {
      throw new Error('거부 사유는 필수 입력 항목입니다.');
    }

    const key = getAttendanceKey(storeId, employeeId, date);
    const attendance = attendanceRecords.get(key);

    if (!attendance) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = AttendanceStatus.REJECTED;
    attendance.notes = notes.trim();

    attendanceRecords.set(key, attendance);
    return attendance;
  }

  @Mutation(() => Attendance, { description: '근태 수정 요청' })
  requestAttendanceCorrection(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string
  ): Attendance {
    // 입력 값 검증
    if (!storeId || storeId.trim().length === 0) {
      throw new Error('지점 ID는 필수 입력 항목입니다.');
    }

    if (!employeeId || employeeId.trim().length === 0) {
      throw new Error('직원 ID는 필수 입력 항목입니다.');
    }

    if (!date || date.trim().length === 0) {
      throw new Error('날짜는 필수 입력 항목입니다.');
    }

    if (!notes || notes.trim().length === 0) {
      throw new Error('수정 요청 사유는 필수 입력 항목입니다.');
    }

    const key = getAttendanceKey(storeId, employeeId, date);
    const attendance = attendanceRecords.get(key);

    if (!attendance) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    attendance.status = AttendanceStatus.PENDING;
    attendance.notes = notes.trim();

    attendanceRecords.set(key, attendance);
    return attendance;
  }
}
