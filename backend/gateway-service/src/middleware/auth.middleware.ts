import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  body?: {
    query?: string;
    variables?: unknown;
  };
  user?: {
    userId: string;
    role: string;
    storeIds?: string[];
  };
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ALGORITHM = 'HS256';

/**
 * JWT 토큰 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  // GraphQL Introspection 쿼리는 인증 없이 허용
  if (
    req.body?.query?.includes('__schema') ||
    req.body?.query?.includes('IntrospectionQuery')
  ) {
    return (next as unknown as () => void)();
  }

  // 헬스 체크는 인증 없이 허용
  // @ts-expect-error - Express Request 타입 추론 문제
  const path = req.path;
  if (path === '/health' || path === '/healthz') {
    // @ts-expect-error - Express NextFunction 타입 추론 문제
    return next();
  }

  // @ts-expect-error - Express Request 타입 추론 문제
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 인증이 필요한 경우에만 에러 반환
    // 일부 쿼리는 공개 접근 가능하도록 허용 (예: 로그인)
    const isPublicQuery =
      req.body?.query?.includes('login') ||
      req.body?.query?.includes('register');

    if (isPublicQuery) {
      return (next as unknown as () => void)();
    }

    return (res as unknown as Response).status(401).json({
      errors: [
        {
          message:
            '인증이 필요합니다. Authorization 헤더에 Bearer 토큰을 포함해주세요.',
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        },
      ],
    });
  }

  const token = authHeader.substring(7); // "Bearer " 제거

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as jwt.JwtPayload;

    // 사용자 정보를 요청 객체에 주입
    req.user = {
      userId: decoded.userId || decoded.sub || '',
      role: decoded.role || 'EMPLOYEE',
      storeIds: decoded.storeIds || [],
    };

    (next as () => void)();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return (res as unknown as Response).status(401).json({
        errors: [
          {
            message: '토큰이 만료되었습니다.',
            extensions: {
              code: 'TOKEN_EXPIRED',
            },
          },
        ],
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return (res as unknown as Response).status(401).json({
        errors: [
          {
            message: '유효하지 않은 토큰입니다.',
            extensions: {
              code: 'INVALID_TOKEN',
            },
          },
        ],
      });
    }

    return (res as unknown as Response).status(401).json({
      errors: [
        {
          message: '인증 처리 중 오류가 발생했습니다.',
          extensions: {
            code: 'AUTH_ERROR',
          },
        },
      ],
    });
  }
}

/**
 * 권한 체크 미들웨어 (간단한 역할 기반)
 */
export function requireRole(...allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      return (res as unknown as Response).status(401).json({
        errors: [
          {
            message: '인증이 필요합니다.',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return (res as unknown as Response).status(403).json({
        errors: [
          {
            message: '이 작업을 수행할 권한이 없습니다.',
            extensions: {
              code: 'FORBIDDEN',
              requiredRoles: allowedRoles,
              userRole: req.user.role,
            },
          },
        ],
      });
    }

    (next as () => void)();
  };
}
