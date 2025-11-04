#!/bin/bash

# 개발 환경 설정 스크립트
# 이 스크립트는 개발 환경을 빠르게 설정하는 데 도움이 됩니다.

set -e

echo "🚀 Store Management 개발 환경 설정을 시작합니다..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 사전 요구사항 확인
echo -e "${YELLOW}사전 요구사항을 확인합니다...${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker가 설치되어 있지 않습니다.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose가 설치되어 있지 않습니다.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ Docker 및 Docker Compose 확인 완료${NC}"

# 2. .env 파일 확인
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env 파일이 없습니다. .env.example을 복사합니다...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env 파일 생성 완료${NC}"
        echo -e "${YELLOW}⚠️  .env 파일을 확인하고 필요한 값을 수정하세요.${NC}"
    else
        echo -e "${RED}.env.example 파일을 찾을 수 없습니다.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env 파일 확인 완료${NC}"
fi

# 3. Docker 이미지 빌드
echo -e "${YELLOW}Docker 이미지를 빌드합니다...${NC}"
docker-compose build

echo -e "${GREEN}✓ Docker 이미지 빌드 완료${NC}"

# 4. 서비스 시작
echo -e "${YELLOW}서비스를 시작합니다...${NC}"
docker-compose up -d

# 5. 서비스 상태 확인
echo -e "${YELLOW}서비스 상태를 확인합니다...${NC}"
sleep 10

# 헬스 체크
echo -e "${YELLOW}헬스 체크를 수행합니다...${NC}"

services=("gateway-service:4000" "attendance-service:4001" "inventory-service:4002" "sales-service:4003")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -f -s "http://localhost:${port}/health" > /dev/null; then
        echo -e "${GREEN}✓ ${name} 정상 작동${NC}"
    else
        echo -e "${RED}✗ ${name} 응답 없음${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 개발 환경 설정이 완료되었습니다!${NC}"
echo ""
echo "서비스 접속 주소:"
echo "  - Frontend: http://localhost:5173"
echo "  - Gateway: http://localhost:4000/graphql"
echo "  - Attendance Service: http://localhost:4001/graphql"
echo "  - Inventory Service: http://localhost:4002/graphql"
echo "  - Sales Service: http://localhost:4003/graphql"
echo ""
echo "유용한 명령어:"
echo "  - 로그 확인: docker-compose logs -f [service-name]"
echo "  - 서비스 중지: docker-compose down"
echo "  - 서비스 재시작: docker-compose restart [service-name]"
echo ""

