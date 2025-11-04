import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  requestId?: string;
  startTime?: number;
}

/**
 * 요청 ID 생성 및 로깅 인터셉터
 */
export function requestIdMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void {
  const requestId = uuidv4();
  req.requestId = requestId;
  req.startTime = Date.now();

  // 요청 ID를 응답 헤더에 추가
  (res as unknown as Response).setHeader('X-Request-Id', requestId);

  // 구조화된 로그 출력
  const request = req as unknown as Request;
  const logData = {
    requestId,
    method: request.method,
    path: request.path,
    ip: request.ip || request.socket.remoteAddress,
    userAgent: request.get('user-agent'),
    timestamp: new Date().toISOString(),
  };

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'Incoming request',
      ...logData,
    })
  );

  // 응답 완료 후 로깅
  const response = res as unknown as Response;
  response.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const request = req as unknown as Request;

    const responseLog = {
      requestId,
      method: request.method,
      path: request.path,
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    const logLevel = response.statusCode >= 400 ? 'error' : 'info';
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        level: logLevel,
        message: 'Request completed',
        ...responseLog,
      })
    );
  });

  (next as unknown as () => void)();
}

/**
 * 에러 로깅 미들웨어
 */
export function errorLoggingMiddleware(
  err: Error,
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';
  const request = req as unknown as Request;

  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: 'error',
      message: 'Request error',
      requestId,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      path: request.path,
      method: request.method,
      timestamp: new Date().toISOString(),
    })
  );

  (next as unknown as (err: Error) => void)(err);
}
