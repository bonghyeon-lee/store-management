import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  userId: string;
  role: string;
  storeIds?: string[];
}

/**
 * JWT 인증 Guard
 * GraphQL 컨텍스트에서 토큰을 검증하고 사용자 정보를 추출합니다.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const authHeader = request?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증이 필요합니다.');
    }

    const token = authHeader.substring(7); // "Bearer " 제거

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        role: string;
        type?: string;
        storeIds?: string[];
      };

      if (decoded.type && decoded.type !== 'access') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      // GraphQL 컨텍스트에 사용자 정보 저장
      request.user = {
        userId: decoded.userId,
        role: decoded.role,
        storeIds: decoded.storeIds || [],
      } as AuthUser;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}

