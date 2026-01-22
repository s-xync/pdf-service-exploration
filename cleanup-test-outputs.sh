#!/bin/bash

# Script to clean up old test PDF outputs

set -e

OUTPUT_DIR="./output"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleaning up test output files${NC}"
echo "=========================================="
echo ""

# Check if output directory exists
if [ ! -d "${OUTPUT_DIR}" ]; then
    echo -e "${YELLOW}Output directory does not exist. Nothing to clean.${NC}"
    exit 0
fi

# Count files before cleanup
BEFORE_COUNT=$(find "${OUTPUT_DIR}" -name "*.pdf" -o -name "*.json" 2>/dev/null | wc -l | tr -d ' ')

if [ "${BEFORE_COUNT}" -eq 0 ]; then
    echo -e "${YELLOW}No test output files found. Nothing to clean.${NC}"
    exit 0
fi

echo -e "${YELLOW}Found ${BEFORE_COUNT} file(s) to clean:${NC}"
find "${OUTPUT_DIR}" -name "*.pdf" -o -name "*.json" 2>/dev/null | while read -r file; do
    echo "  - $(basename "$file")"
done
echo ""

# Remove all PDF and JSON files in output directory
find "${OUTPUT_DIR}" -name "*.pdf" -o -name "*.json" 2>/dev/null | while read -r file; do
    rm -f "$file"
done

# Count files after cleanup
AFTER_COUNT=$(find "${OUTPUT_DIR}" -name "*.pdf" -o -name "*.json" 2>/dev/null | wc -l | tr -d ' ')

echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo -e "   Removed ${BEFORE_COUNT} file(s)"
echo ""

exit 0
