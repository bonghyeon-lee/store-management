# 로그인 후 Products Operation 401 에러 수정

## 상태: ✅ 완료

## 문제 상황

- 프론트엔드에서 로그인 후 Products 쿼리 실행 시 401 에러 발생
- 자동으로 로그인 페이지로 리다이렉트됨

## 원인 분석

1. 로그인 페이지에서 `mockToken = 'mock-jwt-token-' + Date.now()` 형태의 단순 문자열을 생성
2. 이 토큰은 실제 JWT 형식이 아니므로 Gateway의 인증 미들웨어에서 검증 실패
3. `JsonWebTokenError` 발생하여 401 에러 반환
4. 프론트엔드의 Apollo Client errorLink가 401을 감지하여 토큰 제거 후 로그인 페이지로 리다이렉트

## 해결 방법

- 개발 환경에서 사용할 수 있는 실제 JWT 토큰을 생성하도록 수정
- 브라우저의 Web Crypto API를 사용하여 HMAC-SHA256 서명으로 실제 JWT 생성
- Gateway와 동일한 secret을 사용하여 검증 가능한 JWT 토큰 생성

## 수정 파일

- ✅ `frontend/src/pages/login/ui/LoginPage.tsx`: mock token 생성 로직을 실제 JWT 생성으로 변경
- ✅ `frontend/src/shared/lib/auth/jwt-utils.ts`: JWT 생성 유틸리티 추가 (Web Crypto API 사용)

## 구현 내용

1. `jwt-utils.ts` 생성: Web Crypto API를 사용한 실제 JWT 토큰 생성 함수 구현
2. `LoginPage.tsx` 수정: `generateDevJWT` 함수를 사용하여 실제 JWT 토큰 생성
3. Gateway의 JWT_SECRET과 동일한 기본값 사용 (`your-secret-key-change-in-production`)

## 참고사항

- 프로덕션 환경에서는 반드시 백엔드 인증 서비스를 통해 실제 JWT를 발급받아야 함
- 현재는 개발 환경용 임시 해결책
- Web Crypto API는 모든 모던 브라우저에서 지원됨
