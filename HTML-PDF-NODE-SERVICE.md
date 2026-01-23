# HTML-PDF-Node Service

The `html-pdf-node` library has been separated into its own Docker service to avoid conflicts with Playwright dependencies.

## Architecture

- **Main Service** (port 3000): Handles Puppeteer, Playwright, PDFKit, pdfmake, and pdf-lib
- **HTML-PDF-Node Service** (port 3001): Dedicated service for html-pdf-node only

## Why Separate?

1. **Different Puppeteer Versions**: 
   - Main service uses Puppeteer 21.6.1 (with Playwright's Chromium)
   - html-pdf-node bundles its own Puppeteer 10.4.0

2. **Different Chromium Sources**:
   - Main service uses Playwright's Chromium installation
   - html-pdf-node needs its own Chromium (installed via apt)

3. **Simpler Dependencies**:
   - html-pdf-node service doesn't need Playwright at all
   - Smaller, more focused Docker image

## Docker Setup

### Build and Run Both Services

```bash
docker-compose up -d
```

This will start:
- `pdf-api` on port 3000 (main service)
- `html-pdf-node-api` on port 3001 (html-pdf-node service)

### Build Only HTML-PDF-Node Service

```bash
docker build -f Dockerfile.html-pdf-node -t html-pdf-node-service .
docker run -p 3001:3001 html-pdf-node-service
```

## API Endpoints

### HTML-PDF-Node Service (port 3001)

- `GET /health` - Health check
- `GET /api/pdf/library` - Library information
- `POST /api/pdf/generate` - Generate PDF
  ```json
  {
    "data": {
      "patientName": "John Doe",
      "patientDOB": "01/01/1990",
      "medicationName": "Sample Medication",
      "dosage": "10mg",
      "instructions": "Take once daily"
    }
  }
  ```

### Main Service (port 3000)

- All other libraries (Puppeteer, Playwright, PDFKit, etc.)
- Note: html-pdf-node is NOT available on the main service

## Testing

The test script (`test-all-libraries.sh`) automatically tests both services:

```bash
npm run test:api
```

The script will:
1. Test main service libraries (puppeteer-base64, puppeteer-baseurl, playwright-base64, playwright-baseurl)
2. Test html-pdf-node service if available (on port 3001)

## Dockerfile Details

### Dockerfile.html-pdf-node

- Base: `node:20-slim` (ARM64)
- Installs Chromium via `apt` (not Playwright)
- Creates symlink `/usr/bin/chromium-browser` → `/usr/bin/chromium`
- No Playwright dependencies

### Main Dockerfile

- Base: `node:20-slim` (ARM64)
- Installs Playwright's Chromium
- No html-pdf-node dependencies

## Troubleshooting

### HTML-PDF-Node Service Not Starting

1. Check if port 3001 is available:
   ```bash
   lsof -i :3001
   ```

2. Check container logs:
   ```bash
   docker-compose logs html-pdf-node-api
   ```

3. Verify Chromium installation:
   ```bash
   docker-compose exec html-pdf-node-api which chromium-browser
   ```

### Chromium Not Found

If html-pdf-node can't find Chromium:
- Verify the symlink exists: `ls -la /usr/bin/chromium-browser`
- Check Chromium installation: `apt list --installed | grep chromium`
