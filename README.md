# PDF Generation Library Evaluation for ARM Docker Node.js Environment

This project evaluates PDF generation libraries for use in an ARM-based Docker Node.js environment, with a focus on handling complex assets including images and SVGs.

## Overview

The goal is to identify a production-ready PDF generation library that:
- Works in ARM Docker containers
- Handles complex templates with embedded assets (images, SVGs)
- Integrates seamlessly with Node.js APIs
- Supports templating for RX PDFs

## Libraries Evaluated

1. **Puppeteer** - Browser-based PDF generation using Chromium
2. **Playwright** - Browser-based PDF generation with multi-browser support
3. **PDFKit** - Pure JavaScript PDF generation library
4. **pdfmake** - Declarative PDF generation library
5. **pdf-lib** - Modern PDF manipulation and generation library

## Project Structure

```
.
├── tests/              # Individual library test implementations
│   ├── puppeteer-test.js
│   ├── playwright-test.js
│   ├── pdfkit-test.js
│   ├── pdfmake-test.js
│   └── pdf-lib-test.js
├── assets/            # Test assets (images, SVGs, HTML templates)
├── output/            # Generated PDFs and test results
├── server.js          # Express API server for testing
├── test-runner.js     # Run all library tests
├── benchmark.js       # Performance benchmarking
├── Dockerfile         # ARM-compatible Docker configuration
└── docker-compose.yml # Docker Compose setup
```

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run all tests:
```bash
npm test
```

3. Run benchmarks:
```bash
npm run benchmark
```

4. Start API server:
```bash
node server.js
```

### Docker Setup

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Or build manually:
```bash
docker build --platform linux/arm64 -t pdf-gen-test .
docker run -p 3000:3000 pdf-gen-test
```

## API Endpoints

When the server is running:

- `GET /health` - Health check with environment info
- `GET /api/pdf/libraries` - List available libraries
- `POST /api/pdf/generate` - Generate PDF
  ```json
  {
    "library": "puppeteer",
    "data": {
      "patientName": "John Doe",
      "medicationName": "Sample Medication",
      ...
    }
  }
  ```
- `POST /api/pdf/test-all` - Test all libraries

## Testing Individual Libraries

```bash
npm run test:puppeteer
npm run test:playwright
npm run test:pdfkit
npm run test:pdfmake
npm run test:pdf-lib
```

## Evaluation Criteria

1. **ARM Docker Compatibility** - Does it work in ARM containers?
2. **Asset Handling** - Can it handle images and SVGs?
3. **Performance** - Generation time and resource usage
4. **Community Support** - Maintenance and documentation
5. **Ease of Integration** - How easy is it to integrate with templating?

## Results

See `EVALUATION.md` for detailed evaluation results and recommendations.

## Notes

- Browser-based libraries (Puppeteer, Playwright) require Chromium binaries
- Pure JS libraries (PDFKit, pdfmake, pdf-lib) have better ARM compatibility
- SVG support varies significantly between libraries
- HTML/CSS rendering is best with browser-based solutions
# pdf-service-exploration
