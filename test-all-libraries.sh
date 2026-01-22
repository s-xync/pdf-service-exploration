#!/bin/bash

# Script to test all PDF libraries via API in Docker

set -e

API_URL="http://localhost:3000"
OUTPUT_DIR="./output"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing All PDF Libraries via Docker API${NC}"
echo "=========================================="
echo ""

# Check if API is running
echo -e "${YELLOW}Checking API health...${NC}"
if ! curl -s -f "${API_URL}/health" > /dev/null; then
    echo -e "${RED}❌ API is not running at ${API_URL}${NC}"
    echo "Please start the Docker container first:"
    echo "  docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Test data
TEST_DATA='{
  "patientName": "Test Patient",
  "patientDOB": "01/01/1990",
  "medicationName": "Test Medication 100mg",
  "dosage": "100mg",
  "instructions": "Take as directed"
}'

# Libraries to test
# Uncomment the libraries you want to test

# Puppeteer and Playwright variants only (recommended for HTML to PDF)
LIBRARIES=("puppeteer-base64" "puppeteer-baseurl" "playwright-base64" "playwright-baseurl")

# Original Puppeteer and Playwright (old implementations)
# LIBRARIES=("puppeteer" "playwright")

# Other libraries (PDFKit, pdfmake, pdf-lib) - not for HTML to PDF
# LIBRARIES=("pdfkit" "pdfmake" "pdf-lib")

# All Puppeteer and Playwright variants
# LIBRARIES=("puppeteer" "playwright" "puppeteer-base64" "puppeteer-baseurl" "playwright-base64" "playwright-baseurl")

# All libraries (including PDFKit, pdfmake, pdf-lib)
# LIBRARIES=("puppeteer" "playwright" "puppeteer-base64" "puppeteer-baseurl" "playwright-base64" "playwright-baseurl" "pdfkit" "pdfmake" "pdf-lib")

# Create output directory if it doesn't exist
mkdir -p "${OUTPUT_DIR}"

# Test each library
SUCCESS_COUNT=0
FAIL_COUNT=0

for lib in "${LIBRARIES[@]}"; do
    echo -e "${YELLOW}Testing ${lib}...${NC}"

    OUTPUT_FILE="${OUTPUT_DIR}/${lib}-api-test.pdf"

    # Generate PDF
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "${OUTPUT_FILE}" \
        -X POST "${API_URL}/api/pdf/generate" \
        -H "Content-Type: application/json" \
        -d "{\"library\": \"${lib}\", \"data\": ${TEST_DATA}}")

    if [ "${HTTP_CODE}" -eq 200 ]; then
        FILE_SIZE=$(stat -f%z "${OUTPUT_FILE}" 2>/dev/null || stat -c%s "${OUTPUT_FILE}" 2>/dev/null)
        FILE_SIZE_KB=$((FILE_SIZE / 1024))
        echo -e "${GREEN}  ✅ Success - ${FILE_SIZE_KB} KB${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}  ❌ Failed (HTTP ${HTTP_CODE})${NC}"
        if [ -f "${OUTPUT_FILE}" ]; then
            cat "${OUTPUT_FILE}"
            rm "${OUTPUT_FILE}"
        fi
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
done

# Summary
echo "=========================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=========================================="
echo -e "${GREEN}✅ Successful: ${SUCCESS_COUNT}/${#LIBRARIES[@]}${NC}"
echo -e "${RED}❌ Failed: ${FAIL_COUNT}/${#LIBRARIES[@]}${NC}"
echo ""

# List generated files
if [ ${SUCCESS_COUNT} -gt 0 ]; then
    echo -e "${BLUE}Generated PDFs:${NC}"
    ls -lh "${OUTPUT_DIR}"/*-api-test.pdf 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
fi

# Test all at once
echo ""
echo -e "${YELLOW}Testing all libraries at once...${NC}"
curl -s -X POST "${API_URL}/api/pdf/test-all" \
    -H "Content-Type: application/json" \
    -d "{\"data\": ${TEST_DATA}}" | jq '.' > "${OUTPUT_DIR}/all-libraries-test.json" 2>/dev/null || \
    curl -s -X POST "${API_URL}/api/pdf/test-all" \
    -H "Content-Type: application/json" \
    -d "{\"data\": ${TEST_DATA}}" > "${OUTPUT_DIR}/all-libraries-test.json"

echo -e "${GREEN}✅ Results saved to ${OUTPUT_DIR}/all-libraries-test.json${NC}"

exit 0
