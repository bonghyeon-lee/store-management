/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * ISO-8601 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * ISO-8601 날짜/시간 문자열을 YYYY-MM-DD HH:mm:ss 형식으로 변환
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getToday = (): string => {
  return formatDate(new Date());
};

/**
 * 주 시작일(월요일) 계산
 */
export const getWeekStart = (date: Date | string = new Date()): string => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
  const monday = new Date(d.setDate(diff));
  return formatDate(monday);
};

/**
 * 날짜 범위 유효성 검사
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

