# Docker Deployment and Testing Guide

Complete guide for deploying and testing PDF generation libraries in Docker.

## Prerequisites

- Docker installed and running
- Docker Compose (optional, but recommended)
- ARM64 platform support (native or via emulation)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up --build

# The API server will be available at http://localhost:3000
```

### Option 2: Manual Docker Commands

```bash
# Build the image
docker build -t pdf-gen-test .

# Run the container
docker run -d \
  --name pdf-gen-test \
  -p 3000:3000 \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/assets:/app/assets \
  --security-opt seccomp=unconfined \
  --shm-size=2gb \
  pdf-gen-test
```

## Testing Each PDF Library

### Method 1: Using the API Server (Recommended)

Once the container is running, you can test each library via HTTP requests:

#### 1. Test Puppeteer

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "library": "puppeteer",
    "data": {
      "patientName": "John Doe",
      "patientDOB": "01/15/1985",
      "medicationName": "Amoxicillin 500mg",
      "dosage": "500mg",
      "instructions": "Take one capsule three times daily"
    }
  }' \
  --output output/puppeteer-test.pdf
```

#### 2. Test Playwright

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "library": "playwright",
    "data": {
      "patientName": "Jane Smith",
      "patientDOB": "05/20/1990",
      "medicationName": "Ibuprofen 200mg",
      "dosage": "200mg",
      "instructions": "Take as needed for pain"
    }
  }' \
  --output output/playwright-test.pdf
```

#### 3. Test PDFKit

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "library": "pdfkit",
    "data": {
      "patientName": "Bob Johnson",
      "medicationName": "Lisinopril 10mg"
    }
  }' \
  --output output/pdfkit-test.pdf
```

#### 4. Test pdfmake

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "library": "pdfmake",
    "data": {
      "patientName": "Alice Williams",
      "medicationName": "Metformin 500mg"
    }
  }' \
  --output output/pdfmake-test.pdf
```

#### 5. Test pdf-lib

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "library": "pdf-lib",
    "data": {
      "patientName": "Charlie Brown",
      "medicationName": "Atorvastatin 20mg"
    }
  }' \
  --output output/pdf-lib-test.pdf
```

#### Test All Libraries at Once

```bash
curl -X POST http://localhost:3000/api/pdf/test-all \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "patientName": "Test Patient",
      "medicationName": "Test Medication"
    }
  }' | jq
```

### Method 2: Executing Commands Inside Container

#### Run All Tests

```bash
# Using docker-compose
docker-compose exec pdf-api npm test

# Using docker
docker exec pdf-gen-test npm test
```

#### Test Individual Libraries

```bash
# Test Puppeteer
docker-compose exec pdf-api npm run test:puppeteer

# Test Playwright
docker-compose exec pdf-api npm run test:playwright

# Test PDFKit
docker-compose exec pdf-api npm run test:pdfkit

# Test pdfmake
docker-compose exec pdf-api npm run test:pdfmake

# Test pdf-lib
docker-compose exec pdf-api npm run test:pdf-lib
```

#### Run Benchmarks

```bash
docker-compose exec pdf-api npm run benchmark
```

### Method 3: Interactive Shell Testing

```bash
# Start an interactive shell in the container
docker-compose exec pdf-api sh

# Or with docker
docker exec -it pdf-gen-test sh

# Then run commands inside:
node tests/puppeteer-test.js
node tests/playwright-test.js
node tests/pdfkit-test.js
node tests/pdfmake-test.js
node tests/pdf-lib-test.js
```

## Testing (ARM64 Only)

This project is configured for ARM64 architecture only.

### Build for ARM64

```bash
# Using docker build (defaults to ARM64)
docker build --platform linux/arm64 -t pdf-gen-test .

# Run ARM64 container
docker run --platform linux/arm64 \
  -p 3000:3000 \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/assets:/app/assets \
  --security-opt seccomp=unconfined \
  --shm-size=2gb \
  pdf-gen-test
```

### Use the Test Script

```bash
# Make script executable (if not already)
chmod +x test-docker.sh

# Run the test script (tests ARM64)
./test-docker.sh
```

## Viewing Generated PDFs

All PDFs are saved to the `output/` directory, which is mounted as a volume:

```bash
# List generated PDFs
ls -lh output/

# View a PDF (macOS)
open output/puppeteer-test.pdf

# View a PDF (Linux)
xdg-open output/playwright-test.pdf
```

## Health Check

Check if the container is running and healthy:

```bash
# Health check endpoint
curl http://localhost:3000/health | jq

# List available libraries
curl http://localhost:3000/api/pdf/libraries | jq
```

## Troubleshooting

### Issue: Browser-based libraries (Puppeteer/Playwright) fail

**Solution:**
1. Ensure the container has proper security options:
   ```yaml
   security_opt:
     - seccomp:unconfined
   shm_size: '2gb'
   ```

2. Check if browsers are installed:
   ```bash
   docker-compose exec pdf-api npx playwright install chromium
   ```

### Issue: Permission errors with output directory

**Solution:**
```bash
# Fix permissions
chmod -R 777 output/
```

### Issue: Container runs out of memory

**Solution:**
Increase shared memory size in docker-compose.yml:
```yaml
shm_size: '4gb'  # Increase from 2gb
```

### Issue: ARM64 architecture not working

**Solution:**
1. Ensure Docker supports ARM64 platform (native or via emulation)

2. Build with explicit platform:
   ```bash
   docker build --platform linux/arm64 -t pdf-gen-test .
   ```

3. If on non-ARM system, ensure QEMU emulation is enabled:
   ```bash
   docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
   ```

## Complete Testing Workflow

```bash
# 1. Start the container
docker-compose up -d

# 2. Wait for it to be ready
sleep 5

# 3. Check health
curl http://localhost:3000/health

# 4. Test all libraries via API
curl -X POST http://localhost:3000/api/pdf/test-all \
  -H "Content-Type: application/json" \
  -d '{"data": {"patientName": "Test"}}' | jq

# 5. Or test individually
for lib in puppeteer playwright pdfkit pdfmake pdf-lib; do
  echo "Testing $lib..."
  curl -X POST http://localhost:3000/api/pdf/generate \
    -H "Content-Type: application/json" \
    -d "{\"library\": \"$lib\", \"data\": {\"patientName\": \"Test\"}}" \
    --output output/${lib}-api-test.pdf
done

# 6. Run benchmarks
docker-compose exec pdf-api npm run benchmark

# 7. Check results
ls -lh output/
cat output/test-results.json | jq
cat output/benchmark-results.json | jq

# 8. Stop container
docker-compose down
```

## Environment Variables

You can customize the deployment with environment variables:

```bash
# In docker-compose.yml or docker run command
environment:
  - NODE_ENV=production
  - PORT=3000
  - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
```

## Production Considerations

1. **Resource Limits:**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G
         cpus: '1.0'
   ```

2. **Health Checks:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

3. **Logging:**
   ```bash
   # View logs
   docker-compose logs -f pdf-api
   ```

## Next Steps

After testing in Docker:
1. Review generated PDFs in `output/` directory
2. Check `output/test-results.json` for test results
3. Check `output/benchmark-results.json` for performance data
4. Compare results across libraries
5. Choose the best library for your use case
