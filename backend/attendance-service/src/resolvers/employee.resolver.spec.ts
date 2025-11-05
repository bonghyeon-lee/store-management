/**
 * Employee Resolver 테스트 예시
 * 
 * 이 파일은 테스트 프레임워크 설정이 제대로 작동하는지 확인하기 위한 샘플 테스트입니다.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeResolver } from './employee.resolver';

describe('EmployeeResolver', () => {
  let resolver: EmployeeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeResolver],
    }).compile();

    resolver = module.get<EmployeeResolver>(EmployeeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

