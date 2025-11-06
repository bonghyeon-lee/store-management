import { Query, Resolver, Args, Mutation, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../models/attendance.model';
import { CheckInInput, CheckOutInput } from '../models/inputs.model';
import { AttendanceEntity } from '../entities/attendance.entity';
import { AuthGuard, AuthUser } from '../guards/auth.guard';
import {
  PermissionGuard,
  RequirePermissions,
  Permission,
} from '../guards/permission.guard';

// 근무 시간 계산 함수
const calculateWorkingHours = (
  checkInAt: Date | null | undefined,
  checkOutAt: Date | null | undefined
): number | null => {
  if (!checkInAt || !checkOutAt) {
    return null;
  }

  const diffMs = checkOutAt.getTime() - checkInAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.round(diffHours * 100) / 100; // 소수점 둘째 자리까지
};

@Resolver(() => Attendance)
export class AttendanceResolver {
  constructor(
    @InjectRepository(AttendanceEntity)
    private attendanceRepository: Repository<AttendanceEntity>
  ) {}

  @Query(() => Attendance, { nullable: true, description: '출퇴근 기록 조회' })
  async attendance(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string
  ): Promise<Attendance | null> {
    const entity = await this.attendanceRepository.findOne({
      where: { storeId, employeeId, date },
    });
    if (!entity) return null;
    return this.mapEntityToModel(entity);
  }

  @Query(() => [Attendance], { description: '출퇴근 기록 목록 조회' })
  async attendanceRecords(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('status', { type: () => AttendanceStatus, nullable: true })
    status?: AttendanceStatus
  ): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.date >= :startDate', { startDate })
      .andWhere('attendance.date <= :endDate', { endDate });

    if (storeId) {
      queryBuilder.andWhere('attendance.storeId = :storeId', { storeId });
    }

    if (employeeId) {
      queryBuilder.andWhere('attendance.employeeId = :employeeId', {
        employeeId,
      });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Query(() => [Attendance], { description: '승인 대기 목록 조회' })
  async pendingApprovals(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('managerId', { type: () => ID, nullable: true }) managerId?: string
  ): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.status = :status', {
        status: AttendanceStatus.PENDING,
      });

    if (storeId) {
      queryBuilder.andWhere('attendance.storeId = :storeId', { storeId });
    }

    // managerId는 나중에 권한 체크로 확장 가능
    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Mutation(() => Attendance, { description: '출근 기록' })
  async checkIn(@Args('input') input: CheckInInput): Promise<Attendance> {
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
    let checkInDate: Date;
    try {
      checkInDate = new Date(input.checkInAt);
      if (isNaN(checkInDate.getTime())) {
        throw new Error('출근 시간 형식이 올바르지 않습니다.');
      }
    } catch {
      throw new Error('출근 시간 형식이 올바르지 않습니다.');
    }

    // 기존 기록 확인
    const existing = await this.attendanceRepository.findOne({
      where: {
        storeId: input.storeId,
        employeeId: input.employeeId,
        date: input.date,
      },
    });

    if (existing) {
      // 이미 출근 기록이 있으면 업데이트
      existing.checkInAt = checkInDate;
      existing.notes = input.notes;
      existing.workingHours =
        calculateWorkingHours(existing.checkInAt, existing.checkOutAt) ||
        undefined;
      const updated = await this.attendanceRepository.save(existing);
      return this.mapEntityToModel(updated);
    }

    // 새로운 출근 기록 생성
    const entity = this.attendanceRepository.create({
      storeId: input.storeId,
      employeeId: input.employeeId,
      date: input.date,
      checkInAt: checkInDate,
      checkOutAt: undefined,
      status: AttendanceStatus.PENDING,
      notes: input.notes,
      workingHours: undefined,
    });

    const saved = await this.attendanceRepository.save(entity);
    return this.mapEntityToModel(saved);
  }

  @Mutation(() => Attendance, { description: '퇴근 기록' })
  async checkOut(@Args('input') input: CheckOutInput): Promise<Attendance> {
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
    let checkOutDate: Date;
    try {
      checkOutDate = new Date(input.checkOutAt);
      if (isNaN(checkOutDate.getTime())) {
        throw new Error('퇴근 시간 형식이 올바르지 않습니다.');
      }
    } catch {
      throw new Error('퇴근 시간 형식이 올바르지 않습니다.');
    }

    const existing = await this.attendanceRepository.findOne({
      where: {
        storeId: input.storeId,
        employeeId: input.employeeId,
        date: input.date,
      },
    });

    if (!existing) {
      throw new Error('출근 기록을 먼저 입력해주세요.');
    }

    // 출근 시간보다 퇴근 시간이 빠른지 확인
    if (existing.checkInAt) {
      if (checkOutDate <= existing.checkInAt) {
        throw new Error('퇴근 시간은 출근 시간보다 늦어야 합니다.');
      }
    }

    existing.checkOutAt = checkOutDate;
    existing.notes = input.notes || existing.notes;
    existing.workingHours =
      calculateWorkingHours(existing.checkInAt, existing.checkOutAt) ||
      undefined;

    const updated = await this.attendanceRepository.save(existing);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => Attendance, { description: '근태 승인' })
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermissions(Permission.APPROVE_ATTENDANCE)
  async approveAttendance(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string,
    @Args('notes', { nullable: true }) notes?: string,
    @Context() context: { req?: { user?: AuthUser } } = { req: {} }
  ): Promise<Attendance> {
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

    // 권한 확인: HQ_ADMIN은 모든 지점, STORE_MANAGER는 자신의 지점만
    const user = context?.req?.user;
    if (user && user.role !== 'HQ_ADMIN') {
      if (user.storeIds && !user.storeIds.includes(storeId)) {
        throw new Error('해당 지점의 근태를 승인할 권한이 없습니다.');
      }
    }

    const entity = await this.attendanceRepository.findOne({
      where: { storeId, employeeId, date },
    });

    if (!entity) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    // 이미 승인된 경우
    if (entity.status === AttendanceStatus.APPROVED) {
      throw new Error('이미 승인된 근태 기록입니다.');
    }

    entity.status = AttendanceStatus.APPROVED;
    if (notes) {
      entity.notes = notes;
    }

    const updated = await this.attendanceRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => Attendance, { description: '근태 거부' })
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermissions(Permission.APPROVE_ATTENDANCE)
  async rejectAttendance(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string,
    @Context() context: { req?: { user?: AuthUser } } = { req: {} }
  ): Promise<Attendance> {
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

    // 권한 확인: HQ_ADMIN은 모든 지점, STORE_MANAGER는 자신의 지점만
    const user = context?.req?.user;
    if (user && user.role !== 'HQ_ADMIN') {
      if (user.storeIds && !user.storeIds.includes(storeId)) {
        throw new Error('해당 지점의 근태를 거부할 권한이 없습니다.');
      }
    }

    const entity = await this.attendanceRepository.findOne({
      where: { storeId, employeeId, date },
    });

    if (!entity) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    entity.status = AttendanceStatus.REJECTED;
    entity.notes = notes.trim();

    const updated = await this.attendanceRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => Attendance, { description: '근태 수정 요청' })
  async requestAttendanceCorrection(
    @Args('storeId', { type: () => ID }) storeId: string,
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string
  ): Promise<Attendance> {
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

    const entity = await this.attendanceRepository.findOne({
      where: { storeId, employeeId, date },
    });

    if (!entity) {
      throw new Error('출퇴근 기록을 찾을 수 없습니다.');
    }

    entity.status = AttendanceStatus.PENDING;
    entity.notes = notes.trim();

    const updated = await this.attendanceRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  // 엔티티를 GraphQL 모델로 변환
  private mapEntityToModel(entity: AttendanceEntity): Attendance {
    return {
      storeId: entity.storeId,
      employeeId: entity.employeeId,
      date: entity.date,
      checkInAt: entity.checkInAt?.toISOString(),
      checkOutAt: entity.checkOutAt?.toISOString(),
      status: entity.status,
      notes: entity.notes,
      workingHours: entity.workingHours ? Number(entity.workingHours) : undefined,
    };
  }
}
