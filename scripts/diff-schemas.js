#!/usr/bin/env node

/**
 * GraphQL 스키마 변경 감지 스크립트
 *
 * GraphQL Inspector를 사용하여 스키마 변경사항을 감지하고
 * Breaking Change를 확인합니다.
 *
 * 사용법:
 *   npm run schema:diff -- old-schema.graphql new-schema.graphql
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('사용법: npm run schema:diff -- <old-schema> <new-schema>');
  console.error(
    '예시: npm run schema:diff -- schemas/attendance.graphql schemas/attendance.new.graphql'
  );
  process.exit(1);
}

const [oldSchema, newSchema] = args;

// 파일 존재 확인
if (!fs.existsSync(oldSchema)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${oldSchema}`);
  process.exit(1);
}

if (!fs.existsSync(newSchema)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${newSchema}`);
  process.exit(1);
}

console.log('🔍 스키마 변경사항 분석 중...\n');
console.log(`   이전: ${oldSchema}`);
console.log(`   이후: ${newSchema}\n`);

try {
  // GraphQL Inspector를 사용하여 스키마 변경사항 분석
  const output = execSync(
    `npx @graphql-inspector/cli diff ${oldSchema} ${newSchema}`,
    { encoding: 'utf-8', stdio: 'pipe' }
  );

  console.log(output);

  // Breaking Change 확인
  if (output.includes('BREAKING')) {
    console.log('\n⚠️  Breaking Change가 감지되었습니다!');
    console.log('   스키마 변경 전에 팀과 논의하세요.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Breaking Change 없음');
    process.exit(0);
  }
} catch (error) {
  // GraphQL Inspector는 변경사항이 있으면 exit code 1을 반환합니다
  const output = error.stdout || error.message;

  if (output.includes('BREAKING')) {
    console.log(output);
    console.log('\n⚠️  Breaking Change가 감지되었습니다!');
    console.log('   스키마 변경 전에 팀과 논의하세요.\n');
    process.exit(1);
  } else if (output) {
    console.log(output);
    process.exit(0);
  } else {
    console.error('❌ 스키마 비교 중 오류 발생:', error.message);
    process.exit(1);
  }
}
