# Docker Quick Reference

## 🚀 Quick Start

```bash
# Start everything
docker-compose up --build

# Test all libraries
./test-all-libraries.sh
```

## 📋 Test Individual Libraries

### Via API (Recommended)

```bash
# Puppeteer
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "puppeteer", "data": {"patientName": "Test"}}' \
  --output output/puppeteer.pdf

# Playwright
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "playwright", "data": {"patientName": "Test"}}' \
  --output output/playwright.pdf

# PDFKit
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "pdfkit", "data": {"patientName": "Test"}}' \
  --output output/pdfkit.pdf

# pdfmake
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "pdfmake", "data": {"patientName": "Test"}}' \
  --output output/pdfmake.pdf

# pdf-lib
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "pdf-lib", "data": {"patientName": "Test"}}' \
  --output output/pdf-lib.pdf
```

### Via Container Commands

```bash
# Test all
docker-compose exec pdf-api npm test

# Individual tests
docker-compose exec pdf-api npm run test:puppeteer
docker-compose exec pdf-api npm run test:playwright
docker-compose exec pdf-api npm run test:pdfkit
docker-compose exec pdf-api npm run test:pdfmake
docker-compose exec pdf-api npm run test:pdf-lib

# Benchmarks
docker-compose exec pdf-api npm run benchmark
```

## 🔍 Useful Commands

```bash
# Check health
curl http://localhost:3000/health

# List libraries
curl http://localhost:3000/api/pdf/libraries

# View logs
docker-compose logs -f pdf-api

# Stop container
docker-compose down

# Restart container
docker-compose restart
```

## 📁 Output Files

All PDFs are saved to `./output/` directory:
- `puppeteer-test.pdf`
- `playwright-test.pdf`
- `pdfkit-test.pdf`
- `pdfmake-test.pdf`
- `pdf-lib-test.pdf`
- `test-results.json`
- `benchmark-results.json`
