import { Query, Resolver, Args, Mutation, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User, UserRole, AuthToken } from '../models/user.model';
import { RegisterUserInput, LoginInput } from '../models/inputs.model';
import { AuthGuard, AuthUser } from '../guards/auth.guard';
import {
  RolesGuard,
  RequireRoles,
  RequirePermissions,
} from '../guards/roles.guard';
import { Permission } from '../models/role.model';
import { PermissionService } from '../services/permission.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// 인메모리 데이터 저장소 (MVP 단계)
export const users: Map<string, User> = new Map();
export const userCredentials: Map<string, string> = new Map(); // email -> hashed password
export const refreshTokens: Map<string, string> = new Map(); // refreshToken -> userId
let userIdCounter = 1;

// JWT 시크릿 키 (MVP 단계, 프로덕션에서는 환경 변수로 관리)
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

// 비밀번호 해싱
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (
  password: string,
  hashed: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};

// JWT 토큰 생성
const generateAccessToken = (
  userId: string,
  role: UserRole,
  storeId?: string
): string => {
  const payload: any = { userId, role, type: 'access' };
  if (storeId) {
    payload.storeId = storeId;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

@Resolver(() => User)
export class AuthResolver {
  constructor(private permissionService: PermissionService) {}

  @Query(() => User, { nullable: true, description: '현재 사용자 정보 조회' })
  currentUser(@Context() context: any): User | null {
    const authHeader = context.req?.headers?.authorization;
    if (!authHeader) {
      return null;
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = users.get(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  @Query(() => User, { nullable: true, description: '사용자 조회' })
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions(Permission.VIEW_EMPLOYEES)
  user(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any
  ): User | null {
    const user = context.req?.user as AuthUser;
    const targetUser = users.get(id);

    if (!targetUser) {
      return null;
    }

    // 본인 정보 조회는 허용
    if (user.userId === id) {
      return targetUser;
    }

    // 다른 사용자 정보 조회는 권한 및 지점 접근 권한 확인
    if (
      !this.permissionService.canAccessStore(
        user.role,
        user.storeId,
        targetUser.storeId || ''
      )
    ) {
      return null;
    }

    return targetUser;
  }

  @Query(() => [User], { description: '사용자 목록 조회' })
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions(Permission.VIEW_EMPLOYEES)
  users(
    @Context() context: any,
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('role', { type: () => UserRole, nullable: true }) role?: UserRole
  ): User[] {
    const user = context.req?.user as AuthUser;
    let results = Array.from(users.values());

    // 지점 필터링
    if (storeId) {
      // 권한 확인: HQ_ADMIN은 모든 지점 접근 가능
      if (
        !this.permissionService.canAccessStore(user.role, user.storeId, storeId)
      ) {
        return [];
      }
      results = results.filter((u) => u.storeId === storeId);
    } else {
      // HQ_ADMIN이 아니면 할당된 지점만 필터링
      if (user.role !== 'HQ_ADMIN' && user.storeId) {
        results = results.filter((u) => u.storeId === user.storeId);
      }
    }

    // 역할 필터링
    if (role) {
      results = results.filter((u) => u.role === role);
    }

    return results;
  }

  @Mutation(() => User, { description: '사용자 등록' })
  async registerUser(@Args('input') input: RegisterUserInput): Promise<User> {
    // 이메일 중복 확인
    const existingUser = Array.from(users.values()).find(
      (u) => u.email === input.email
    );
    if (existingUser) {
      throw new Error('이미 등록된 이메일입니다.');
    }

    const id = `user-${userIdCounter++}`;
    const now = new Date().toISOString();

    const user: User = {
      id,
      email: input.email,
      name: input.name,
      role: input.role,
      storeId: input.storeId,
      createdAt: now,
    };

    users.set(id, user);
    const hashedPassword = await hashPassword(input.password);
    userCredentials.set(input.email, hashedPassword);

    return user;
  }

  @Mutation(() => AuthToken, { description: '로그인' })
  async login(@Args('input') input: LoginInput): Promise<AuthToken> {
    const user = Array.from(users.values()).find(
      (u) => u.email === input.email
    );

    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const hashedPassword = userCredentials.get(input.email);
    if (
      !hashedPassword ||
      !(await verifyPassword(input.password, hashedPassword))
    ) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date().toISOString();
    users.set(user.id, user);

    const accessToken = generateAccessToken(user.id, user.role, user.storeId);
    const refreshToken = generateRefreshToken(user.id);

    // Refresh token 저장
    refreshTokens.set(refreshToken, user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Mutation(() => AuthToken, { description: '토큰 갱신' })
  refreshToken(@Args('refreshToken') refreshToken: string): AuthToken {
    try {
      // Refresh token 검증
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        throw new Error('유효하지 않은 refresh token입니다.');
      }

      // 저장된 refresh token 확인
      const storedUserId = refreshTokens.get(refreshToken);
      if (!storedUserId || storedUserId !== decoded.userId) {
        throw new Error('유효하지 않은 refresh token입니다.');
      }

      const user = users.get(decoded.userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 새 토큰 발급
      const newAccessToken = generateAccessToken(
        user.id,
        user.role,
        user.storeId
      );
      const newRefreshToken = generateRefreshToken(user.id);

      // 기존 refresh token 제거 및 새 토큰 저장
      refreshTokens.delete(refreshToken);
      refreshTokens.set(newRefreshToken, user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      throw new Error('유효하지 않은 refresh token입니다.');
    }
  }

  @Mutation(() => Boolean, { description: '로그아웃' })
  logout(
    @Args('refreshToken', { nullable: true }) refreshToken?: string
  ): boolean {
    // Refresh token 무효화
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    return true;
  }
}
