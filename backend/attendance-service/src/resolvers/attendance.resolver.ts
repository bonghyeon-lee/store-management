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
}

@Resolver('Attendance')
export class AttendanceResolver {
  @Query('attendance')
  attendance(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
  ): Attendance | null {
    return {
      storeId,
      employeeId,
      date,
      checkInAt: '09:00',
      checkOutAt: '18:00',
      status: 'APPROVED',
      notes: null,
    };
  }

  @Mutation('approveAttendance')
  approveAttendance(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes?: string,
  ): Attendance {
    return {
      storeId,
      employeeId,
      date,
      checkInAt: '09:00',
      checkOutAt: '18:00',
      status: 'APPROVED',
      notes: notes ?? null,
    };
  }

  @Mutation('requestAttendanceCorrection')
  requestAttendanceCorrection(
    @Args('storeId') storeId: string,
    @Args('employeeId') employeeId: string,
    @Args('date') date: string,
    @Args('notes') notes: string,
  ): Attendance {
    return {
      storeId,
      employeeId,
      date,
      status: 'PENDING',
      notes,
      checkInAt: null,
      checkOutAt: null,
    };
  }
}


