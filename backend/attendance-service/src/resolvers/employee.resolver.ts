import { Query, Resolver, Args, Mutation, InputType, Field } from '@nestjs/graphql';

type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED';

interface Employee {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  employmentStatus: EmploymentStatus;
  assignedStoreIds: string[];
  createdAt: string;
  updatedAt: string;
}

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
    employmentStatus: 'ACTIVE',
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
    employmentStatus: 'ACTIVE',
    assignedStoreIds: ['STORE-001'],
    createdAt: now,
    updatedAt: now,
  });
};

initializeSampleData();

@Resolver('Employee')
export class EmployeeResolver {
  @Query('employee')
  employee(@Args('id') id: string): Employee | null {
    return employees.get(id) || null;
  }

  @Query('employees')
  employees(
    @Args('storeId') storeId?: string,
    @Args('role') role?: string,
    @Args('status') status?: EmploymentStatus,
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

  @Mutation('createEmployee')
  createEmployee(
    @Args('input')
    input: {
      name: string;
      email?: string;
      phone?: string;
      role: string;
      assignedStoreIds: string[];
    },
  ): Employee {
    const id = `EMP-${String(employees.size + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const employee: Employee = {
      id,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      role: input.role,
      employmentStatus: 'ACTIVE',
      assignedStoreIds: input.assignedStoreIds,
      createdAt: now,
      updatedAt: now,
    };

    employees.set(id, employee);
    return employee;
  }

  @Mutation('updateEmployee')
  updateEmployee(
    @Args('id') id: string,
    @Args('input')
    input: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      employmentStatus?: EmploymentStatus;
      assignedStoreIds?: string[];
    },
  ): Employee {
    const employee = employees.get(id);
    if (!employee) {
      throw new Error(`직원을 찾을 수 없습니다: ${id}`);
    }

    const updated: Employee = {
      ...employee,
      ...(input.name && { name: input.name }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.role && { role: input.role }),
      ...(input.employmentStatus && { employmentStatus: input.employmentStatus }),
      ...(input.assignedStoreIds && { assignedStoreIds: input.assignedStoreIds }),
      updatedAt: new Date().toISOString(),
    };

    employees.set(id, updated);
    return updated;
  }

  @Mutation('deleteEmployee')
  deleteEmployee(@Args('id') id: string): boolean {
    const employee = employees.get(id);
    if (!employee) {
      return false;
    }

    // 실제 삭제 대신 비활성화
    employee.employmentStatus = 'INACTIVE';
    employee.updatedAt = new Date().toISOString();
    employees.set(id, employee);
    return true;
  }
}

