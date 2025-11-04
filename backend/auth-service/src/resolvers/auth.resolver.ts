import { Query, Resolver, Args, Mutation, ID, Context } from '@nestjs/graphql';
import { User, UserRole, AuthToken } from '../models/user.model';
import { RegisterUserInput, LoginInput } from '../models/inputs.model';

// 인메모리 데이터 저장소 (MVP 단계)
export const users: Map<string, User> = new Map();
export const userCredentials: Map<string, string> = new Map(); // email -> hashed password
let userIdCounter = 1;

// 간단한 비밀번호 해싱 (MVP 단계, 프로덕션에서는 bcrypt 사용)
const hashPassword = (password: string): string => {
  return Buffer.from(password).toString('base64');
};

const verifyPassword = (password: string, hashed: string): boolean => {
  return hashPassword(password) === hashed;
};

// 간단한 JWT 토큰 생성 (MVP 단계, 프로덕션에서는 jwt 라이브러리 사용)
const generateToken = (userId: string): string => {
  const payload = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

@Resolver(() => User)
export class AuthResolver {
  @Query(() => User, { nullable: true, description: '현재 사용자 정보 조회' })
  currentUser(@Context() context: any): User | null {
    // MVP 단계에서는 간단히 처리
    const authHeader = context.req?.headers?.authorization;
    if (!authHeader) {
      return null;
    }
    // 실제로는 토큰 검증 및 사용자 조회 필요
    return null;
  }

  @Query(() => User, { nullable: true, description: '사용자 조회' })
  user(@Args('id', { type: () => ID }) id: string): User | null {
    return users.get(id) || null;
  }

  @Query(() => [User], { description: '사용자 목록 조회' })
  users(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('role', { type: () => UserRole, nullable: true }) role?: UserRole
  ): User[] {
    let results = Array.from(users.values());

    if (storeId) {
      results = results.filter((u) => u.storeId === storeId);
    }

    if (role) {
      results = results.filter((u) => u.role === role);
    }

    return results;
  }

  @Mutation(() => User, { description: '사용자 등록' })
  registerUser(@Args('input') input: RegisterUserInput): User {
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
    userCredentials.set(input.email, hashPassword(input.password));

    return user;
  }

  @Mutation(() => AuthToken, { description: '로그인' })
  login(@Args('input') input: LoginInput): AuthToken {
    const user = Array.from(users.values()).find(
      (u) => u.email === input.email
    );

    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const hashedPassword = userCredentials.get(input.email);
    if (!hashedPassword || !verifyPassword(input.password, hashedPassword)) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date().toISOString();
    users.set(user.id, user);

    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(`${user.id}-refresh`);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Mutation(() => AuthToken, { description: '토큰 갱신' })
  refreshToken(@Args('refreshToken') refreshToken: string): AuthToken {
    // MVP 단계에서는 간단히 처리
    // 실제로는 토큰 검증 및 새 토큰 발급 필요
    throw new Error('토큰 갱신 기능은 MVP 단계에서 구현되지 않았습니다.');
  }

  @Mutation(() => Boolean, { description: '로그아웃' })
  logout(): boolean {
    // MVP 단계에서는 토큰 무효화 처리 없음
    return true;
  }
}

