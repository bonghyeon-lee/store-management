import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { Employee, EmploymentStatus } from '../models/employee.model';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../models/inputs.model';

// 인메모리 데이터 저장소 (MVP 단계)
const employees: Map<string, Employee> = new Map();

// 초기 샘플 데이터
const initializeSampleData = () => {
  const now = new Date().toISOString();
  employees.set('EMP-001', {
    id: 'EMP-001',
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    role: 'STORE_MANAGER',
    employmentStatus: EmploymentStatus.ACTIVE,
    assignedStoreIds: ['STORE-001'],
    createdAt: now,
    updatedAt: now,
  });
  employees.set('EMP-002', {
    id: 'EMP-002',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-2345-6789',
    role: 'EMPLOYEE',
    employmentStatus: EmploymentStatus.ACTIVE,
    assignedStoreIds: ['STORE-001'],
    createdAt: now,
    updatedAt: now,
  });
};

initializeSampleData();

@Resolver(() => Employee)
export class EmployeeResolver {
  @Query(() => Employee, { nullable: true, description: '직원 조회' })
  employee(@Args('id', { type: () => ID }) id: string): Employee | null {
    return employees.get(id) || null;
  }

  @Query(() => [Employee], { description: '직원 목록 조회' })
  employees(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('role', { nullable: true }) role?: string,
    @Args('status', { type: () => EmploymentStatus, nullable: true })
    status?: EmploymentStatus
  ): Employee[] {
    let result = Array.from(employees.values());

    // 필터링
    if (storeId) {
      result = result.filter((emp) => emp.assignedStoreIds.includes(storeId));
    }
    if (role) {
      result = result.filter((emp) => emp.role === role);
    }
    if (status) {
      result = result.filter((emp) => emp.employmentStatus === status);
    }

    return result;
  }

  @Mutation(() => Employee, { description: '직원 생성' })
  createEmployee(@Args('input') input: CreateEmployeeInput): Employee {
    const id = `EMP-${String(employees.size + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const employee: Employee = {
      id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      employmentStatus: EmploymentStatus.ACTIVE,
      assignedStoreIds: input.assignedStoreIds,
      createdAt: now,
      updatedAt: now,
    };

    employees.set(id, employee);
    return employee;
  }

  @Mutation(() => Employee, { description: '직원 정보 수정' })
  updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeInput
  ): Employee {
    const employee = employees.get(id);
    if (!employee) {
      throw new Error(`직원을 찾을 수 없습니다: ${id}`);
    }

    const updated: Employee = {
      ...employee,
      ...(input.name && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.role && { role: input.role }),
      ...(input.employmentStatus && {
        employmentStatus: input.employmentStatus,
      }),
      ...(input.assignedStoreIds && {
        assignedStoreIds: input.assignedStoreIds,
      }),
      updatedAt: new Date().toISOString(),
    };

    employees.set(id, updated);
    return updated;
  }

  @Mutation(() => Boolean, { description: '직원 삭제/비활성화' })
  deleteEmployee(@Args('id', { type: () => ID }) id: string): boolean {
    const employee = employees.get(id);
    if (!employee) {
      return false;
    }

    // 실제 삭제 대신 비활성화
    employee.employmentStatus = EmploymentStatus.INACTIVE;
    employee.updatedAt = new Date().toISOString();
    employees.set(id, employee);
    return true;
  }
}
