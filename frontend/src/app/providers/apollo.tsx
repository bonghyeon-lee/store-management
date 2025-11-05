import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { tokenStorage } from '@shared/lib/auth/token-storage';

// GraphQL 엔드포인트 URL (환경 변수 또는 기본값)
const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const httpLink = new HttpLink({
  uri: graphqlEndpoint,
  // fetch 옵션 설정
  fetchOptions: {
    // 네트워크 에러 발생 시 재시도에 대한 기본 설정
    // (RetryLink가 더 세밀한 제어를 제공)
  },
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

// 재시도 Link 설정
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      // 네트워크 에러 또는 5xx 서버 에러만 재시도
      if (error) {
        const networkError = error.networkError;
        if (networkError) {
          // 네트워크 연결 실패
          if ('statusCode' in networkError) {
            // 5xx 서버 에러만 재시도 (4xx 클라이언트 에러는 재시도하지 않음)
            const statusCode = networkError.statusCode;
            return statusCode >= 500 && statusCode < 600;
          }
          // 네트워크 연결 실패 (타임아웃, 연결 끊김 등)
          return true;
        }
      }
      return false;
    },
  },
});

// 에러 처리 (401 에러 시 토큰 제거)
const errorLink = onError(({ graphQLErrors, networkError }) => {
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
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // 캐시 정책 설정 (필요 시 추가)
      Query: {
        fields: {
          // 예: employees 쿼리 캐시 정책
          employees: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  // 기본 옵션 설정
  defaultOptions: {
    watchQuery: {
      // 쿼리 에러 시에도 캐시 사용
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
