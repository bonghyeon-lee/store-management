/**
 * JWT 토큰 저장소 관리
 */
const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  /**
   * 토큰 저장
   */
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * 토큰 조회
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 토큰 제거
   */
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * 토큰 존재 여부 확인
   */
  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

