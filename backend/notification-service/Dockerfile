# 멀티 스테이지 빌드 - 빌드 단계
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./
COPY tsconfig.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY src ./src

# 빌드
RUN npm run build

# 프로덕션 단계
FROM node:20-alpine AS production

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist
# schema.gql은 런타임에 애플리케이션 시작 시 자동 생성됨 (autoSchemaFile 옵션)

# 포트 노출
EXPOSE 4004

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4004/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 실행
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]

