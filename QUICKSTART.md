# Quick Start Guide

Get up and running with PDF generation library evaluation in 5 minutes.

## Prerequisites

- Node.js 20+ installed
- Docker (optional, for ARM testing)
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

This installs all 5 PDF libraries:
- puppeteer
- playwright
- pdfkit
- pdfmake
- pdf-lib

## Step 2: Run Tests

### Test All Libraries
```bash
npm test
```

This will:
- Test each library
- Generate sample PDFs
- Show performance metrics
- Save results to `output/test-results.json`

### Test Individual Library
```bash
npm run test:puppeteer
npm run test:playwright
npm run test:pdfkit
npm run test:pdfmake
npm run test:pdf-lib
```

## Step 3: Run Benchmarks

```bash
npm run benchmark
```

This runs 5 iterations of each library and compares:
- Average generation time
- File sizes
- Success rates

## Step 4: Start API Server

```bash
node server.js
```

The server runs on `http://localhost:3000` with endpoints:

- **Health Check:**
  ```bash
  curl http://localhost:3000/health
  ```

- **List Libraries:**
  ```bash
  curl http://localhost:3000/api/pdf/libraries
  ```

- **Generate PDF:**
  ```bash
  curl -X POST http://localhost:3000/api/pdf/generate \
    -H "Content-Type: application/json" \
    -d '{
      "library": "playwright",
      "data": {
        "patientName": "John Doe",
        "medicationName": "Amoxicillin 500mg"
      }
    }' \
    --output test.pdf
  ```

- **Test All Libraries:**
  ```bash
  curl -X POST http://localhost:3000/api/pdf/test-all \
    -H "Content-Type: application/json" \
    -d '{"data": {"patientName": "Test"}}'
  ```

## Step 5: Test POC Implementation

```bash
node poc/playwright-poc.js
```

This demonstrates the production-ready Playwright implementation with:
- Browser instance reuse
- Template support
- Error handling
- Health checks

## Docker Testing (Optional)

### Build and Run
```bash
docker-compose up --build
```

### Test ARM Compatibility
```bash
./test-docker.sh
```

## View Results

Generated PDFs are saved to `output/` directory:
- `puppeteer-test.pdf`
- `playwright-test.pdf`
- `pdfkit-test.pdf`
- `pdfmake-test.pdf`
- `pdf-lib-test.pdf`
- `poc-playwright.pdf`

Test results:
- `output/test-results.json` - Test results
- `output/benchmark-results.json` - Benchmark data

## Troubleshooting

### Playwright/Puppeteer Issues

If browser-based libraries fail:
1. Ensure system dependencies are installed (see Dockerfile)
2. Check browser installation: `npx playwright install chromium`
3. Verify ARM compatibility in Docker

### Pure JS Libraries

If PDFKit/pdfmake/pdf-lib fail:
- These are pure JavaScript, should work everywhere
- Check Node.js version (requires 18+)
- Verify file permissions for output directory

### Docker Issues

If Docker build fails:
- Ensure Docker Buildx is installed
- Check platform support: `docker buildx ls`
- Try building for specific platform: `docker build --platform linux/arm64 .`

## Next Steps

1. Read `EVALUATION.md` for detailed analysis
2. Review `POC-IMPLEMENTATION.md` for production guidance
3. Check `SUMMARY.md` for project overview

## Architecture Detection

The test runner automatically detects your architecture:
- ARM64 (Apple Silicon, ARM servers)
- ARM64 only

Results are saved with architecture information for comparison.
