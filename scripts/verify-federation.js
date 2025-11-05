#!/usr/bin/env node

/**
 * Federation 스키마 통합 검증 스크립트
 * 
 * 모든 Subgraph 서비스가 정상적으로 연결되고,
 * Federation 스키마가 올바르게 컴파일되는지 검증합니다.
 */

const { execSync } = require('child_process');
const http = require('http');

const SUBGRAPHS = [
  { name: 'attendance', url: 'http://localhost:4001/graphql', port: 4001 },
  { name: 'inventory', url: 'http://localhost:4002/graphql', port: 4002 },
  { name: 'sales', url: 'http://localhost:4003/graphql', port: 4003 },
  { name: 'notification', url: 'http://localhost:4004/graphql', port: 4004 },
  { name: 'auth', url: 'http://localhost:4005/graphql', port: 4005 },
];

const GATEWAY_URL = 'http://localhost:4000/graphql';

// 서비스 헬스 체크
async function checkHealth(url) {
  return new Promise((resolve, reject) => {
    const healthUrl = url.replace('/graphql', '/health');
    const req = http.get(healthUrl, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Health check failed: ${res.statusCode}`));
      }
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

// GraphQL 스키마 조회
async function fetchSchema(url) {
  const query = JSON.stringify({
    query: `
      query {
        __schema {
          types {
            name
            kind
          }
        }
      }
    `,
  });

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': query.length,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            if (result.errors) {
              reject(new Error(JSON.stringify(result.errors)));
            } else {
              resolve(result.data);
            }
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(query);
    req.end();
  });
}

// Federation 스키마 검증
async function verifyFederationSchema() {
  try {
    const query = JSON.stringify({
      query: `
        query {
          __schema {
            queryType {
              name
              fields {
                name
              }
            }
            types {
              name
              kind
              fields {
                name
              }
            }
          }
        }
      `,
    });

    return new Promise((resolve, reject) => {
      const urlObj = new URL(GATEWAY_URL);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': query.length,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(data);
              if (result.errors) {
                reject(new Error(JSON.stringify(result.errors)));
              } else {
                resolve(result.data);
              }
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(query);
      req.end();
    });
  } catch (error) {
    throw new Error(`Federation schema verification failed: ${error.message}`);
  }
}

// 메인 검증 함수
async function main() {
  console.log('🔍 Federation 통합 검증 시작...\n');

  let allPassed = true;

  // 1. 각 Subgraph 서비스 헬스 체크
  console.log('1️⃣  Subgraph 서비스 헬스 체크');
  for (const subgraph of SUBGRAPHS) {
    try {
      await checkHealth(subgraph.url);
      console.log(`   ✅ ${subgraph.name} (${subgraph.port})`);
    } catch (error) {
      console.error(`   ❌ ${subgraph.name} (${subgraph.port}): ${error.message}`);
      allPassed = false;
    }
  }

  // 2. 각 Subgraph 스키마 조회
  console.log('\n2️⃣  Subgraph 스키마 조회');
  const subgraphTypes = {};
  for (const subgraph of SUBGRAPHS) {
    try {
      const schema = await fetchSchema(subgraph.url);
      const types = schema.__schema?.types || [];
      subgraphTypes[subgraph.name] = types.map((t) => t.name).filter(Boolean);
      console.log(`   ✅ ${subgraph.name}: ${types.length} types`);
    } catch (error) {
      console.error(`   ❌ ${subgraph.name}: ${error.message}`);
      allPassed = false;
    }
  }

  // 3. Gateway 헬스 체크
  console.log('\n3️⃣  Gateway 헬스 체크');
  try {
    await checkHealth(GATEWAY_URL);
    console.log(`   ✅ Gateway (4000)`);
  } catch (error) {
    console.error(`   ❌ Gateway: ${error.message}`);
    allPassed = false;
  }

  // 4. Federation 스키마 검증
  console.log('\n4️⃣  Federation 통합 스키마 검증');
  try {
    const federationSchema = await verifyFederationSchema();
    const queryFields = federationSchema.__schema?.queryType?.fields || [];
    const allTypes = federationSchema.__schema?.types || [];
    
    console.log(`   ✅ 통합 스키마 조회 성공`);
    console.log(`   📊 Query 필드 수: ${queryFields.length}`);
    console.log(`   📊 전체 타입 수: ${allTypes.length}`);
    
    // Federation 키 확인
    const keyTypes = ['Employee', 'Product', 'InventoryItem', 'Order', 'User', 'Notification'];
    const foundTypes = allTypes
      .map((t) => t.name)
      .filter((name) => keyTypes.includes(name));
    
    console.log(`   🔑 Federation 키 타입: ${foundTypes.join(', ')}`);
    
    if (foundTypes.length < keyTypes.length) {
      console.warn(`   ⚠️  일부 Federation 키 타입이 누락되었을 수 있습니다`);
    }
  } catch (error) {
    // 인증 오류인 경우 경고만 표시
    if (error.message.includes('401') || error.message.includes('UNAUTHENTICATED')) {
      console.warn(`   ⚠️  Gateway 인증 필요: ${error.message}`);
      console.warn(`   ℹ️  Gateway가 Introspection 쿼리를 허용하도록 설정되어 있는지 확인하세요.`);
      console.warn(`   ℹ️  개발 환경에서는 인증 미들웨어에서 Introspection 쿼리를 제외할 수 있습니다.`);
    } else {
      console.error(`   ❌ Federation 스키마 검증 실패: ${error.message}`);
      allPassed = false;
    }
  }

  // 5. 요약
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ 모든 검증 통과!');
    process.exit(0);
  } else {
    console.log('❌ 일부 검증 실패');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('검증 중 오류 발생:', error);
  process.exit(1);
});

