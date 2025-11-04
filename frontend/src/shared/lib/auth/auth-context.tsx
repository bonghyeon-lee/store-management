import React, { createContext, useCallback,useContext, useEffect, useState } from 'react';

import { tokenStorage } from './token-storage';

interface User {
  userId: string;
  role: string;
  storeIds?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 인증 상태 관리 Provider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 인증 상태 확인
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (token) {
      // 토큰이 있으면 사용자 정보 복원 (실제로는 토큰에서 디코딩하거나 API 호출)
      // 임시로 localStorage에서 사용자 정보 가져오기
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // 파싱 실패 시 토큰 제거
          tokenStorage.removeToken();
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    tokenStorage.setToken(token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

