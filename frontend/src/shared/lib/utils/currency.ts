/**
 * 통화 포맷팅 유틸리티
 */

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * @param amount 금액
 * @returns 포맷팅된 문자열 (예: ₩1,234,567)
 */
export const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString('ko-KR')}`;
};

/**
 * 숫자를 한국 원화 형식으로 포맷팅 (원 단위 표시)
 * @param amount 금액
 * @returns 포맷팅된 문자열 (예: 1,234,567원)
 */
export const formatCurrencyKRW = (amount: number): string => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

/**
 * 통화 문자열을 숫자로 변환
 * @param currencyString 포맷팅된 통화 문자열
 * @returns 숫자
 */
export const parseCurrency = (currencyString: string): number => {
  return Number(currencyString.replace(/[₩,원]/g, ''));
};

