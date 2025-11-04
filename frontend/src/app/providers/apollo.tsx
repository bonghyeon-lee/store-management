import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { tokenStorage } from '@shared/lib/auth/token-storage';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

// 인증 헤더 추가
const authLink = setContext((_, { headers }) => {
  const token = tokenStorage.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 에러 처리 (401 에러 시 토큰 제거)
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error('GraphQL Error:', message, extensions);

      if (extensions?.code === 'UNAUTHENTICATED' || extensions?.code === 'TOKEN_EXPIRED') {
        // 인증 에러 시 토큰 제거
        tokenStorage.removeToken();
        localStorage.removeItem('auth_user');
        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    });
  }

  if (networkError) {
    console.error('Network Error:', networkError);
    // 네트워크 에러 처리 (예: 401, 400 응답)
    if ('statusCode' in networkError) {
      if (networkError.statusCode === 401) {
        tokenStorage.removeToken();
        localStorage.removeItem('auth_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // 400 에러는 GraphQL 쿼리 문제일 수 있으므로 로그만 남김
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
