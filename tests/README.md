# 통합 테스트

이 디렉토리에는 프로젝트의 통합 테스트가 포함되어 있습니다.

## 설치

```bash
# 루트 디렉토리에서
npm install
```

## 테스트 실행

### 전체 테스트 실행
```bash
npm test
```

### Federation 통합 테스트만 실행
```bash
npm run test:federation
```

### Watch 모드로 실행
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

## 사전 요구사항

테스트를 실행하기 전에 모든 서비스가 실행 중이어야 합니다:

```bash
# Docker Compose를 사용하는 경우
docker-compose up -d

# 또는 각 서비스를 개별적으로 시작
cd backend/attendance-service && npm run dev
cd backend/inventory-service && npm run dev
cd backend/sales-service && npm run dev
cd backend/notification-service && npm run dev
cd backend/auth-service && npm run dev
cd backend/gateway-service && npm run dev
```

## 테스트 내용

### Federation 통합 검증 테스트 (`federation-integration.test.ts`)

1. **스키마 통합 검증**
   - Gateway에서 통합 스키마 조회
   - 모든 서비스의 타입이 통합 스키마에 포함되는지 확인

2. **서비스 간 데이터 조인 검증**
   - InventoryItem에서 Product 정보 조회
   - Federation 확장이 올바르게 작동하는지 확인

3. **기본 쿼리 검증**
   - Employee, Product, Order 조회 테스트

4. **N+1 문제 해결 검증**
   - DataLoader를 통한 배치 로딩 확인
   - 성능 측정

## 환경 변수

- `GATEWAY_URL`: Gateway 서비스 URL (기본값: `http://localhost:4000/graphql`)

```bash
GATEWAY_URL=http://localhost:4000/graphql npm test
```

## 문제 해결

### 테스트가 실패하는 경우

1. **모든 서비스가 실행 중인지 확인**
   ```bash
   curl http://localhost:4000/health
   curl http://localhost:4001/health
   curl http://localhost:4002/health
   curl http://localhost:4003/health
   curl http://localhost:4004/health
   curl http://localhost:4005/health
   ```

2. **Gateway가 모든 서비스에 연결되었는지 확인**
   - Gateway 로그 확인
   - 각 서비스의 GraphQL 엔드포인트 확인

3. **타임아웃 오류가 발생하는 경우**
   - `jest.config.js`의 `testTimeout` 값 증가
   - 서비스 시작 시간이 오래 걸리는 경우 대기 시간 추가

