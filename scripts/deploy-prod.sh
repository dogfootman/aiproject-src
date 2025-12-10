#!/bin/bash
# Production 배포 스크립트

set -e

echo "📦 Building for production..."
npm run build

echo "✅ Build completed successfully"
echo "🚀 Ready for deployment"

# 실제 배포 명령어 추가
# docker build -t aiproject:latest .
# docker push aiproject:latest
