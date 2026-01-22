#!/bin/bash

# Script to test PDF generation in Docker (ARM64 only)

set -e

echo "🐳 Docker PDF Generation Test (ARM64)"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PLATFORM="linux/arm64"
IMAGE_NAME="pdf-gen-test:arm64"

echo -e "${YELLOW}Building Docker image for ${PLATFORM}...${NC}"

# Build for ARM64 platform
docker build --platform ${PLATFORM} -t ${IMAGE_NAME} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed for ${PLATFORM}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful for ${PLATFORM}${NC}"

# Run tests in container
echo "Running tests in container..."
docker run --rm --platform ${PLATFORM} \
    -v "$(pwd)/output:/app/output" \
    -v "$(pwd)/assets:/app/assets" \
    ${IMAGE_NAME} \
    npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed for ${PLATFORM}${NC}"
else
    echo -e "${RED}❌ Tests failed for ${PLATFORM}${NC}"
    exit 1
fi

echo ""
echo "=============================="
echo -e "${GREEN}✅ Docker testing complete!${NC}"
