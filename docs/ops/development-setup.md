# 개발 환경 설정 가이드

이 문서는 Store Management 시스템의 로컬 개발 환경을 설정하는 방법을 설명합니다.

## 사전 요구사항

- Docker 및 Docker Compose 설치
- Node.js 20+ (선택 사항, 로컬 개발 시)
- Git

## 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd store-management
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

필요에 따라 `.env` 파일의 값을 수정합니다.

### 3. Docker Compose로 서비스 시작

#### 프로덕션 모드 (빌드된 이미지 사용)

```bash
docker-compose up -d
```

#### 개발 모드 (핫 리로드, 코드 변경사항 즉시 반영)

```bash
docker-compose -f docker-compose.dev.yml up
```

모든 서비스가 시작되면 다음 주소에서 접근할 수 있습니다:

- Frontend: http://localhost:5173
- Gateway: http://localhost:4000/graphql
- Attendance Service: http://localhost:4001/graphql
- Inventory Service: http://localhost:4002/graphql
- Sales Service: http://localhost:4003/graphql
- Notification Service: http://localhost:4004/graphql
- Auth Service: http://localhost:4005/graphql

### 4. 서비스 상태 확인

```bash
# 모든 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f [service-name]

# 헬스 체크
curl http://localhost:4000/health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
```

### 5. 서비스 중지

```bash
docker-compose down
```

데이터를 유지하면서 중지하려면:

```bash
docker-compose stop
```

데이터를 삭제하고 중지하려면:

```bash
docker-compose down -v
```

## 개발 모드 (핫 리로드)

### 개발용 Docker Compose 사용

코드 변경사항이 바로 반영되는 개발 모드를 사용하려면 `docker-compose.dev.yml`을 사용합니다:

```bash
docker-compose -f docker-compose.dev.yml up
```

이 모드에서는:
- 백엔드 서비스: 소스 코드 변경 시 자동 재시작 (nodemon)
- 프론트엔드: Vite HMR로 즉시 반영
- 모든 서비스가 소스 코드를 볼륨으로 마운트하여 변경사항 감지

### 로컬 개발 모드 (Docker 없이)

Docker Compose는 프로덕션 모드로 빌드된 이미지를 사용합니다. Docker 없이 로컬에서 개발하려면:

#### 백엔드 서비스

각 서비스 디렉토리에서:

```bash
cd backend/attendance-service
npm ci
npm run dev  # 또는 npm run start:dev
```

#### 프론트엔드

```bash
cd frontend
npm ci
npm run dev
```

**참고**: 로컬 개발 시 PostgreSQL과 Redis는 Docker Compose로 실행해야 합니다:

```bash
docker-compose up postgres redis
```

## 환경 변수

주요 환경 변수:

- `POSTGRES_USER`: PostgreSQL 사용자명 (기본값: storeuser)
- `POSTGRES_PASSWORD`: PostgreSQL 비밀번호 (기본값: storepass)
- `POSTGRES_DB`: 데이터베이스 이름 (기본값: storemanagement)
- `JWT_SECRET`: JWT 토큰 서명 키 (프로덕션에서는 반드시 변경)
- `ALLOWED_ORIGINS`: CORS 허용 도메인 (쉼표로 구분)
- `VITE_API_URL`: 프론트엔드에서 사용할 API URL

## 데이터베이스 접근

PostgreSQL에 직접 접근하려면:

```bash
docker-compose exec postgres psql -U storeuser -d storemanagement
```

Redis에 접근하려면:

```bash
docker-compose exec redis redis-cli
```

## 문제 해결

### 포트 충돌

이미 사용 중인 포트가 있다면 `.env` 파일에서 포트를 변경하세요.

### 서비스가 시작되지 않음

1. 로그 확인: `docker-compose logs [service-name]`
2. 의존성 확인: PostgreSQL과 Redis가 먼저 시작되어야 합니다
3. 헬스 체크 확인: `docker-compose ps`로 서비스 상태 확인

### 빌드 오류

1. Docker 이미지 재빌드: `docker-compose build --no-cache`
2. 캐시 정리: `docker system prune -a`

### 데이터베이스 연결 오류

1. PostgreSQL이 실행 중인지 확인: `docker-compose ps postgres`
2. 연결 문자열 확인: `.env` 파일의 `DATABASE_URL` 확인
3. 네트워크 확인: 모든 서비스가 같은 네트워크에 있는지 확인

## 추가 리소스

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [프로젝트 아키텍처 문서](../architecture/overview.md)
- [백엔드 서비스 문서](../backend/README.md)
