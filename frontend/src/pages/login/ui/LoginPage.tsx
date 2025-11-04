import React, { useState } from 'react';
import { useAuth } from '@shared/lib/auth/auth-context';
import { Button } from '@shared/ui/Button';
import { apolloClient } from '@app/providers/apollo';
import { gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        userId
        role
        storeIds
      }
    }
  }
`;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: 실제 로그인 API가 구현되면 사용
      // 현재는 임시로 토큰을 생성하여 사용
      // const { data } = await apolloClient.mutate({
      //   mutation: LOGIN_MUTATION,
      //   variables: { email, password },
      // });

      // 임시 로그인 처리 (실제 구현 시 제거)
      if (email && password) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        const mockUser = {
          userId: '1',
          role: 'MANAGER',
          storeIds: ['store-1'],
        };
        login(mockToken, mockUser);
        window.location.href = '/';
      } else {
        setError('이메일과 비밀번호를 입력해주세요.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h1 style={{ marginBottom: 24 }}>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
            }}
            required
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: 16, fontSize: 14 }}>{error}</div>
        )}
        <Button type="submit" disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        <p>임시 로그인: 이메일과 비밀번호를 입력하면 로그인됩니다.</p>
      </div>
    </div>
  );
};

