/**
 * Button 컴포넌트 테스트 예시
 * 
 * 이 파일은 프론트엔드 테스트 프레임워크 설정이 제대로 작동하는지 확인하기 위한 샘플 테스트입니다.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

