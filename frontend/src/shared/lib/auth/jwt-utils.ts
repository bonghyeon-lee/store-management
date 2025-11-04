/**
 * 개발 환경용 JWT 토큰 생성 유틸리티
 *
 * 주의: 프로덕션 환경에서는 반드시 백엔드 인증 서비스를 통해 실제 JWT를 발급받아야 합니다.
 */

interface JwtPayload {
  userId: string;
  role: string;
  storeIds?: string[];
  iat?: number;
  exp?: number;
}

/**
 * JWT 토큰 생성 (개발 환경용)
 *
 * 실제 JWT 형식의 토큰을 생성합니다. Gateway의 secret과 동일한 값을 사용하여
 * 실제로 검증 가능한 JWT를 생성합니다.
 *
 * @param payload JWT 페이로드
 * @param secret JWT secret (Gateway와 동일해야 함)
 * @returns JWT 토큰 문자열 (Promise)
 */
export async function generateDevJWT(
  payload: JwtPayload,
  secret: string = 'your-secret-key-change-in-production',
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24시간 후 만료
  };

  // Base64 URL 인코딩
  const base64UrlEncode = (str: string): string => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // JSON을 문자열로 변환 후 인코딩
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));

  // HMAC-SHA256 서명 생성
  const signature = await generateSignature(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * HMAC-SHA256 서명 생성
 *
 * 브라우저의 Web Crypto API를 사용하여 실제 JWT 서명을 생성합니다.
 */
async function generateSignature(data: string, secret: string): Promise<string> {
  // TextEncoder를 사용하여 문자열을 Uint8Array로 변환
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  // HMAC 키 생성
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // 서명 생성
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  // Base64 URL 인코딩
  return arrayBufferToBase64Url(signature);
}

/**
 * ArrayBuffer를 Base64 URL 문자열로 변환
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
