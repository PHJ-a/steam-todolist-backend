#!/bin/bash

# scripts/health_check.sh

# .env 파일 로드
if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    echo ".env file not found"
    exit 1
fi

# BACK_END_URL이 설정되어 있는지 확인
if [ -z "$BACK_END_URL" ]; then
    echo "BACK_END_URL is not set in .env file"
    exit 1
fi

# 헬스 체크 수행
response=$(curl -sS -o /dev/null -w "%{http_code}" "${BACK_END_URL}")
if [ $response = "200" ]; then
    echo "Health check passed for ${BACK_END_URL}"
    exit 0
else
    echo "Health check failed for ${BACK_END_URL} with status code: $response"
    exit 1
fi