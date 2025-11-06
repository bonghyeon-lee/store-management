import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmploymentStatus } from '../models/employee.model';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../models/inputs.model';
import { EmployeeEntity } from '../entities/employee.entity';

@Resolver(() => Employee)
export class EmployeeResolver {
  constructor(
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>
  ) {}

  @Query(() => Employee, { nullable: true, description: '직원 조회' })
  async employee(@Args('id', { type: () => ID }) id: string): Promise<Employee | null> {
    const entity = await this.employeeRepository.findOne({ where: { id } });
    if (!entity) return null;
    return this.mapEntityToModel(entity);
  }

  @Query(() => [Employee], { description: '직원 목록 조회' })
  async employees(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('role', { nullable: true }) role?: string,
    @Args('status', { type: () => EmploymentStatus, nullable: true })
    status?: EmploymentStatus
  ): Promise<Employee[]> {
    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    // 필터링
    if (storeId) {
      queryBuilder.andWhere("employee.assignedStoreIds LIKE :storeId", {
        storeId: `%${storeId}%`,
      });
    }
    if (role) {
      queryBuilder.andWhere('employee.role = :role', { role });
    }
    if (status) {
      queryBuilder.andWhere('employee.employmentStatus = :status', { status });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Mutation(() => Employee, { description: '직원 생성' })
  async createEmployee(@Args('input') input: CreateEmployeeInput): Promise<Employee> {
    // 입력 값 검증
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('이름은 필수 입력 항목입니다.');
    }

    if (!input.role || input.role.trim().length === 0) {
      throw new Error('역할은 필수 입력 항목입니다.');
    }

    if (!input.assignedStoreIds || input.assignedStoreIds.length === 0) {
      throw new Error('할당된 지점 ID는 최소 1개 이상 필요합니다.');
    }

    // 이메일 형식 검증
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
      }
    }

    // 전화번호 형식 검증 (선택적)
    if (input.phone) {
      const phoneRegex = /^[0-9-]+$/;
      if (!phoneRegex.test(input.phone)) {
        throw new Error('올바른 전화번호 형식이 아닙니다.');
      }
    }

    const entity = this.employeeRepository.create({
      name: input.name.trim(),
      email: input.email?.trim(),
      phone: input.phone?.trim(),
      role: input.role.trim(),
      employmentStatus: EmploymentStatus.ACTIVE,
      assignedStoreIds: input.assignedStoreIds,
    });

    const saved = await this.employeeRepository.save(entity);
    return this.mapEntityToModel(saved);
  }

  @Mutation(() => Employee, { description: '직원 정보 수정' })
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeInput
  ): Promise<Employee> {
    const entity = await this.employeeRepository.findOne({ where: { id } });
    if (!entity) {
      throw new Error(`직원을 찾을 수 없습니다: ${id}`);
    }

    // 입력 값 검증
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error('이름은 비어있을 수 없습니다.');
    }

    if (input.role !== undefined && input.role.trim().length === 0) {
      throw new Error('역할은 비어있을 수 없습니다.');
    }

    if (
      input.assignedStoreIds !== undefined &&
      input.assignedStoreIds.length === 0
    ) {
      throw new Error('할당된 지점 ID는 최소 1개 이상 필요합니다.');
    }

    // 이메일 형식 검증
    if (input.email !== undefined && input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
      }
    }

    // 전화번호 형식 검증
    if (input.phone !== undefined && input.phone) {
      const phoneRegex = /^[0-9-]+$/;
      if (!phoneRegex.test(input.phone)) {
        throw new Error('올바른 전화번호 형식이 아닙니다.');
      }
    }

    // 업데이트
    if (input.name !== undefined) entity.name = input.name.trim();
    if (input.email !== undefined) entity.email = input.email?.trim();
    if (input.phone !== undefined) entity.phone = input.phone?.trim();
    if (input.role !== undefined) entity.role = input.role.trim();
    if (input.employmentStatus !== undefined)
      entity.employmentStatus = input.employmentStatus;
    if (input.assignedStoreIds !== undefined)
      entity.assignedStoreIds = input.assignedStoreIds;

    const updated = await this.employeeRepository.save(entity);
    return this.mapEntityToModel(updated);
  }

  @Mutation(() => Boolean, { description: '직원 삭제/비활성화' })
  async deleteEmployee(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const entity = await this.employeeRepository.findOne({ where: { id } });
    if (!entity) {
      return false;
    }

    // 실제 삭제 대신 비활성화
    entity.employmentStatus = EmploymentStatus.INACTIVE;
    await this.employeeRepository.save(entity);
    return true;
  }

  // 엔티티를 GraphQL 모델로 변환
  private mapEntityToModel(entity: EmployeeEntity): Employee {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      role: entity.role,
      employmentStatus: entity.employmentStatus,
      assignedStoreIds: entity.assignedStoreIds,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
