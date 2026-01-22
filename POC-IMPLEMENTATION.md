# Proof of Concept: Playwright PDF Generation

This document provides a production-ready proof-of-concept implementation using Playwright, the recommended library.

## Overview

The POC demonstrates:
- PDF generation from HTML templates
- Asset handling (images, SVGs)
- Template variable substitution
- Error handling
- Performance optimization

## Implementation

### Basic Usage

```javascript
import { generatePDFWithPlaywright } from './tests/playwright-test.js';

const pdfResult = await generatePDFWithPlaywright({
  date: '12/15/2024',
  patientName: 'Jane Smith',
  patientDOB: '05/15/1985',
  medicationName: 'Amoxicillin 500mg',
  dosage: '500mg',
  instructions: 'Take one capsule three times daily with meals'
});

if (pdfResult.success) {
  // PDF generated successfully
  console.log(`Generated in ${pdfResult.generationTime}ms`);
  console.log(`File size: ${pdfResult.fileSize} bytes`);
}
```

### API Integration

```javascript
// Express.js endpoint example
app.post('/api/generate-rx-pdf', async (req, res) => {
  try {
    const { patientData, rxData } = req.body;
    
    const result = await generatePDFWithPlaywright({
      date: new Date().toLocaleDateString(),
      patientName: patientData.name,
      patientDOB: patientData.dob,
      medicationName: rxData.medication,
      dosage: rxData.dosage,
      instructions: rxData.instructions
    });
    
    if (result.success) {
      const pdfBuffer = await fs.readFile(result.outputPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Advanced: Browser Instance Reuse

For better performance in production, reuse browser instances:

```javascript
import { chromium } from 'playwright';

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  }
  return browserInstance;
}

async function generatePDFOptimized(data) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // ... PDF generation logic ...
  } finally {
    await page.close();
    // Don't close browser - reuse it
  }
}
```

### Docker Configuration

The Dockerfile is configured for ARM support:

```dockerfile
FROM node:20-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    # ... dependencies ...

# Install Playwright browsers
RUN npx playwright install chromium

# ... rest of configuration ...
```

### Template System Integration

For more complex templating, integrate with Handlebars or similar:

```javascript
import Handlebars from 'handlebars';
import fs from 'fs/promises';

async function generatePDFFromTemplate(templatePath, data) {
  // Load and compile template
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);
  const html = template(data);
  
  // Generate PDF with Playwright
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  
  return pdf;
}
```

## Performance Optimization Tips

1. **Reuse Browser Instances:** Launch browser once, create new pages for each PDF
2. **Parallel Processing:** Use worker threads or cluster for concurrent generation
3. **Caching:** Cache compiled templates and frequently used assets
4. **Resource Limits:** Set appropriate memory limits in Docker
5. **Monitoring:** Track generation times and memory usage

## Error Handling

```javascript
async function generatePDFSafe(data) {
  try {
    const result = await generatePDFWithPlaywright(data);
    return result;
  } catch (error) {
    // Log error
    console.error('PDF generation error:', error);
    
    // Return structured error
    return {
      success: false,
      error: error.message,
      errorCode: 'PDF_GENERATION_FAILED'
    };
  }
}
```

## Testing

Test the POC implementation:

```bash
# Test Playwright implementation
npm run test:playwright

# Run all tests
npm test

# Benchmark
npm run benchmark
```

## Production Checklist

- [ ] Set up proper error handling and logging
- [ ] Configure browser instance pooling
- [ ] Set up monitoring and alerts
- [ ] Test in ARM Docker environment
- [ ] Load testing with expected traffic
- [ ] Configure resource limits (memory, CPU)
- [ ] Set up health checks
- [ ] Document API endpoints
- [ ] Create deployment pipeline
