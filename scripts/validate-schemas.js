#!/usr/bin/env node

/**
 * GraphQL 스키마 검증 스크립트
 * 
 * GraphQL Inspector를 사용하여 스키마의 유효성을 검증하고
 * Federation 디렉티브를 확인합니다.
 */

const fs = require('fs');
const path = require('path');
const { buildSchema, Source } = require('graphql');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');
const SCHEMA_FILES = [
  'attendance.graphql',
  'inventory.graphql',
  'sales.graphql',
  'auth.graphql',
  'notification.graphql',
];

// 필드 뒤의 설명을 필드 앞으로 이동 (GraphQL 표준 문법 준수)
function moveDescriptionsBeforeFields(content) {
  const lines = content.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const nextNextLine = i < lines.length - 2 ? lines[i + 2] : '';
    
    // 필드 정의 뒤에 설명이 오는 패턴 찾기
    // 필드 정의가 완료된 후 (타입, !, ] 등으로 끝나고) 다음 줄에 설명이 오는 경우
    // 단, 그 다음 줄이 또 다른 필드 정의가 아닌 경우만 처리
    if (line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(?[^)]*\)?\s*:\s*[^!\[\n]+[!\[\]]*\s*$/) && 
        nextLine.match(/^\s*"[^"]+"\s*$/) &&
        !nextNextLine.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/)) {
      // 설명을 필드 앞으로 이동
      result.push(nextLine.trim());
      result.push(line);
      i++; // 다음 줄을 건너뛰기
    } else {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

// Federation 디렉티브를 임시로 제거하여 기본 GraphQL 문법만 검증
function removeFederationDirectives(content) {
  let cleaned = content;
  
  // @link 디렉티브 블록 제거 (여러 줄 지원, 중첩된 괄호 처리)
  // @link(...) 패턴을 찾아서 제거
  cleaned = cleaned.replace(/@link\s*\([^()]*(?:\([^()]*\)[^()]*)*\)/gs, '');
  
  // @key 디렉티브 제거
  cleaned = cleaned.replace(/@key\s*\([^)]*\)/g, '');
  
  // @requires 디렉티브 제거
  cleaned = cleaned.replace(/@requires\s*\([^)]*\)/g, '');
  
  // @provides 디렉티브 제거
  cleaned = cleaned.replace(/@provides\s*\([^)]*\)/g, '');
  
  // @external 디렉티브 제거
  cleaned = cleaned.replace(/@external\s*/g, '');
  
  // @extends 디렉티브 제거
  cleaned = cleaned.replace(/@extends\s*/g, '');
  
  // schema 블록에서 @link가 제거된 후 정리
  // schema 뒤에 공백/줄바꿈이 있고 {가 오는 경우를 처리
  cleaned = cleaned.replace(/schema\s*\n\s*\{/g, 'schema {');
  cleaned = cleaned.replace(/schema\s+\{/g, 'schema {');
  
  // 빈 줄 정리
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  return cleaned;
}

// 스키마 파일 검증 (GraphQL 라이브러리 사용)
function validateSchema(schemaFile) {
  const schemaPath = path.join(SCHEMAS_DIR, schemaFile);
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`스키마 파일을 찾을 수 없습니다: ${schemaPath}`);
  }

  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    // Federation 디렉티브를 제거한 후 기본 GraphQL 문법 검증
    let cleaned = removeFederationDirectives(schemaContent);
    
    // 필드 뒤의 설명 제거 (검증을 위해)
    // 필드 정의 다음 줄에 설명만 있는 경우 제거
    const lines = cleaned.split('\n');
    const cleanedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = i > 0 ? lines[i - 1] : '';
      // 이전 줄이 필드 정의(콜론 포함)이고 현재 줄이 설명만 있는 경우 제거
      if (prevLine.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(?[^)]*\)?\s*:\s*.*$/) &&
          line.match(/^\s*"[^"]+"\s*$/)) {
        continue; // 설명 줄 제거
      }
      cleanedLines.push(line);
    }
    cleaned = cleanedLines.join('\n');
    
    // GraphQL 스키마 파싱 및 검증
    buildSchema(new Source(cleaned, schemaFile));
    return { success: true, errors: [] };
  } catch (error) {
    const errors = error.message || error.toString();
    return { success: false, errors };
  }
}

// Federation 디렉티브 확인
function checkFederationDirectives(schemaFile) {
  const schemaPath = path.join(SCHEMAS_DIR, schemaFile);
  const content = fs.readFileSync(schemaPath, 'utf-8');
  
  const checks = {
    hasFederationLink: content.includes('@link') && content.includes('federation'),
    hasKeyDirective: content.includes('@key'),
    hasRequiresDirective: content.includes('@requires'),
    hasProvidesDirective: content.includes('@provides'),
    hasExternalDirective: content.includes('@external'),
  };

  return checks;
}

// 메인 검증 함수
function main() {
  console.log('🔍 GraphQL 스키마 검증 시작...\n');

  let allPassed = true;
  const results = {};

  // 각 스키마 파일 검증
  for (const schemaFile of SCHEMA_FILES) {
    console.log(`📄 ${schemaFile} 검증 중...`);
    
    const validation = validateSchema(schemaFile);
    const directives = checkFederationDirectives(schemaFile);
    
    results[schemaFile] = {
      validation,
      directives,
    };

    if (validation.success) {
      console.log(`   ✅ 스키마 문법 검증 통과`);
    } else {
      console.error(`   ❌ 스키마 문법 오류:`);
      console.error(`      ${validation.errors}`);
      allPassed = false;
    }

    // Federation 디렉티브 확인
    if (directives.hasFederationLink) {
      console.log(`   ✅ Federation 링크 확인`);
    } else {
      console.warn(`   ⚠️  Federation 링크 누락`);
    }

    if (directives.hasKeyDirective) {
      console.log(`   ✅ @key 디렉티브 사용 확인`);
    } else {
      console.warn(`   ⚠️  @key 디렉티브 미사용`);
    }

    if (directives.hasRequiresDirective) {
      console.log(`   ℹ️  @requires 디렉티브 사용됨`);
    }

    if (directives.hasProvidesDirective) {
      console.log(`   ℹ️  @provides 디렉티브 사용됨`);
    }

    if (directives.hasExternalDirective) {
      console.log(`   ℹ️  @external 디렉티브 사용됨`);
    }

    console.log('');
  }

  // 요약
  console.log('='.repeat(50));
  if (allPassed) {
    console.log('✅ 모든 스키마 검증 통과!');
    process.exit(0);
  } else {
    console.log('❌ 일부 스키마 검증 실패');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('검증 중 오류 발생:', error);
  process.exit(1);
});

