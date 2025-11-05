# Dependency Management Strategy

**작성일**: 2025-11-07  
**버전**: 1.0  
**담당자**: Platform/Ops Team

## 개요

이 문서는 Store Management Platform의 의존성 관리 전략을 정의합니다. 보안, 안정성, 유지보수성을 확보하기 위한 의존성 관리 원칙과 프로세스를 제공합니다.

---

## 버전 관리 전략

### Semantic Versioning

모든 패키지는 [Semantic Versioning](https://semver.org/)을 준수합니다:

- **Major (X.0.0)**: Breaking changes 포함
- **Minor (0.X.0)**: 새로운 기능 추가 (하위 호환)
- **Patch (0.0.X)**: 버그 수정 (하위 호환)

### 버전 선택 원칙

1. **LTS 버전 우선**
   - Node.js: LTS 버전 사용 (현재: >=18.0.0)
   - 프레임워크: 안정적인 LTS 버전 선택

2. **의존성 고정**
   - `package-lock.json` 또는 `yarn.lock` 사용
   - 버전 범위 지정 시 주의:
     - `^`: Minor 업데이트 허용 (권장)
     - `~`: Patch 업데이트만 허용
     - 고정 버전: 특정 버전만 사용 (주의 필요)

3. **버전 범위 예시**

```json
{
  "dependencies": {
    "react": "^18.3.1",           // Minor 업데이트 허용
    "typescript": "~5.6.3",       // Patch 업데이트만 허용
    "express": "4.21.2"           // 고정 버전 (주의 필요)
  }
}
```

---

## 라이선스 관리

### 라이선스 정책

**허용되는 라이선스**:
- **MIT**: 대부분의 오픈소스 라이브러리
- **Apache 2.0**: GraphQL, Apollo 등
- **BSD**: PostgreSQL 등
- **ISC**: Node.js 기본 패키지

**제한되는 라이선스**:
- **GPL**: 상용 제품 배포 시 문제 발생 가능
- **AGPL**: 클라우드 서비스 배포 시 문제 발생 가능
- **LGPL**: 상업적 사용 시 주의 필요

### 라이선스 검사 도구

1. **license-checker**
   ```bash
   npm install -g license-checker
   license-checker --summary
   ```

2. **GitHub Dependabot**
   - 자동 라이선스 검사
   - 취약점 알림

3. **정기 검토**
   - 분기별: 전체 라이선스 검사
   - 신규 의존성 추가 시: 즉시 검사

---

## 보안 취약점 관리

### 자동화 도구

#### 1. npm audit / yarn audit

```bash
# 취약점 검사
npm audit

# 자동 수정 (가능한 경우)
npm audit fix

# 강제 수정 (주의 필요)
npm audit fix --force
```

#### 2. GitHub Dependabot

`.github/dependabot.yml` 설정:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

#### 3. Snyk (선택)

- 고급 보안 스캔
- 취약점 우선순위 분석
- CI/CD 통합

### 보안 검토 프로세스

1. **자동 스캔**
   - 주간: GitHub Dependabot 자동 실행
   - PR 생성 시: 자동 스캔 실행

2. **수동 검토**
   - Critical/High 취약점: 즉시 검토
   - Medium 취약점: 주간 검토
   - Low 취약점: 월간 검토

3. **대응 프로세스**

```
취약점 발견
  ↓
심각도 평가 (CVSS 점수)
  ↓
Critical/High → 즉시 패치 적용
Medium → 1주일 내 적용
Low → 다음 업데이트 사이클에 포함
  ↓
테스트 및 배포
```

### 취약점 데이터베이스

- **NVD (National Vulnerability Database)**: 공식 취약점 데이터베이스
- **Snyk Vulnerability DB**: 상세한 취약점 정보
- **GitHub Security Advisories**: GitHub 관련 취약점

---

## 의존성 업데이트 전략

### 업데이트 분류

#### 1. Patch 업데이트 (0.0.X)

**자동 업데이트 권장**:
- 보안 패치
- 버그 수정
- 낮은 리스크

**프로세스**:
```
Dependabot PR 생성
  ↓
자동 테스트 실행
  ↓
리뷰 (간단한 검토)
  ↓
병합 및 배포
```

#### 2. Minor 업데이트 (0.X.0)

**수동 검토 필요**:
- 새로운 기능 추가
- 하위 호환성 확인 필요
- 중간 리스크

**프로세스**:
```
Dependabot PR 생성
  ↓
자동 테스트 실행
  ↓
변경 로그 검토
  ↓
스테이징 환경 테스트
  ↓
리뷰 및 승인
  ↓
병합 및 배포
```

#### 3. Major 업데이트 (X.0.0)

**신중한 검토 필요**:
- Breaking changes 포함
- 마이그레이션 가이드 검토
- 높은 리스크

**프로세스**:
```
수동 이슈 생성
  ↓
마이그레이션 가이드 작성
  ↓
영향 분석
  ↓
스프린트 계획 수립
  ↓
개발 및 테스트
  ↓
스테이징 환경 검증
  ↓
프로덕션 배포
```

### 업데이트 일정

1. **정기 업데이트**
   - **주간**: Patch 업데이트 자동 적용
   - **월간**: Minor 업데이트 검토 및 적용
   - **분기별**: Major 업데이트 검토 및 계획

2. **긴급 업데이트**
   - Critical 보안 취약점: 즉시 적용
   - High 보안 취약점: 24시간 내 적용

### 업데이트 테스트

1. **단위 테스트**
   - 모든 업데이트는 기존 테스트 통과 필수

2. **통합 테스트**
   - 서비스 간 통합 테스트 실행
   - GraphQL Federation 테스트

3. **스테이징 환경**
   - 실제 데이터로 테스트
   - 성능 테스트

4. **롤백 계획**
   - 업데이트 실패 시 롤백 절차
   - 버전 태그 관리

---

## 의존성 분류

### 프로덕션 의존성 (dependencies)

**기준**:
- 런타임에 필요한 패키지
- 프로덕션 빌드에 포함되는 패키지

**예시**:
- React, NestJS, GraphQL
- Apollo Client, Express
- 데이터베이스 드라이버

### 개발 의존성 (devDependencies)

**기준**:
- 개발 및 빌드 시에만 필요한 패키지
- 프로덕션 빌드에 포함되지 않는 패키지

**예시**:
- TypeScript, ESLint, Prettier
- 테스트 프레임워크 (Jest, Vitest)
- 빌드 도구 (Vite, Webpack)

### 선택적 의존성 (optionalDependencies)

**사용하지 않음**: 현재 프로젝트에서는 사용하지 않습니다.

---

## 모노레포 의존성 관리

### 구조

```
store-management/
├── package.json (루트)
├── frontend/
│   └── package.json
├── backend/
│   ├── gateway-service/
│   │   └── package.json
│   ├── attendance-service/
│   │   └── package.json
│   └── ...
└── tests/
    └── package.json
```

### 공통 의존성 관리

1. **루트 레벨 공통 도구**
   - TypeScript 버전 통일
   - 테스트 프레임워크 통일
   - 린트 도구 통일

2. **서비스별 독립 의존성**
   - 각 서비스는 필요한 의존성만 포함
   - 서비스별 독립 버전 관리 가능

3. **워크스페이스 활용** (향후)
   - npm/yarn workspaces
   - 공통 패키지 공유

---

## 의존성 검토 체크리스트

### 신규 의존성 추가 시

- [ ] 라이선스 확인 (허용 목록 확인)
- [ ] 보안 취약점 검사 (`npm audit`)
- [ ] 메인테이너 활동 확인 (GitHub stars, 최근 업데이트)
- [ ] 문서화 품질 확인
- [ ] 번들 크기 고려 (프론트엔드)
- [ ] 대안 기술 검토
- [ ] 팀 리뷰 및 승인

### 정기 검토 항목

- [ ] 사용하지 않는 의존성 제거
- [ ] 중복 의존성 확인
- [ ] 오래된 의존성 업데이트 계획
- [ ] 보안 취약점 스캔
- [ ] 라이선스 재검토

---

## 도구 및 자동화

### 사용 도구

1. **npm audit**
   - 기본 보안 스캔
   - 취약점 자동 수정

2. **GitHub Dependabot**
   - 자동 업데이트 PR
   - 보안 알림

3. **license-checker**
   - 라이선스 검사
   - 리포트 생성

4. **npm-check-updates** (선택)
   - 업데이트 가능한 패키지 확인
   - 버전 업데이트

### CI/CD 통합

```yaml
# .github/workflows/dependency-check.yml
name: Dependency Check
on:
  schedule:
    - cron: '0 0 * * 1'  # 매주 월요일
  pull_request:
    paths:
      - '**/package.json'
      - '**/package-lock.json'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      - name: Check licenses
        run: npx license-checker --summary
```

---

## 모범 사례

### DO

✅ **의존성 최소화**
- 정말 필요한 패키지만 추가
- 대안 구현 검토

✅ **명시적 버전 지정**
- `package-lock.json` 커밋
- 버전 범위 명확히 지정

✅ **정기 업데이트**
- 보안 패치는 즉시 적용
- 정기적인 업데이트 일정

✅ **문서화**
- 의존성 선택 이유 문서화
- 마이그레이션 가이드 작성

### DON'T

❌ **과도한 의존성**
- 작은 기능을 위해 큰 라이브러리 추가
- 중복 기능 라이브러리 사용

❌ **최신 버전 무작정 사용**
- 안정성 확인 없이 최신 버전 사용
- Breaking changes 검토 없이 업데이트

❌ **보안 업데이트 지연**
- Critical/High 취약점 방치
- 테스트 없이 업데이트

---

## 참고 문서

- [Technology Stack Selection](../architecture/technology-stack-selection.md)
- [CI/CD Pipeline](./cicd-pipeline.md)
- [Security Guidelines](./README.md)

---

## 부록: 주요 의존성 현황

### 프론트엔드

- React: ^18.3.1
- TypeScript: ~5.6.3
- Apollo Client: ^3.11.8
- Vite: ^5.4.10
- Vitest: ^3.2.4

### 백엔드

- NestJS: ^10.4.20
- GraphQL: ^16.9.0
- Apollo Federation: ^2.9.0
- Express: ^4.21.2
- TypeScript: ^5.7.2

### 인프라

- Node.js: >=18.0.0
- Docker: 최신 LTS
- Kubernetes: 최신 안정 버전

**마지막 업데이트**: 2025-11-07


