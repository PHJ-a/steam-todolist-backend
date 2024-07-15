#!/bin/bash

# scripts/health_check.sh
response=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ $response = "200" ]; then
  echo "Health check passed"
  exit 0
else
  echo "Health check failed with status code: $response"
  exit 1
fi