import express from 'express';
// Puppeteer and Playwright variants
import { generatePDFWithPuppeteerBase64 } from './tests/puppeteer-base64-test.js';
import { generatePDFWithPuppeteerBaseURL } from './tests/puppeteer-baseurl-test.js';
import { generatePDFWithPlaywrightBase64 } from './tests/playwright-base64-test.js';
import { generatePDFWithPlaywrightBaseURL } from './tests/playwright-baseurl-test.js';
import { generatePDFWithPuppeteer } from './tests/puppeteer-test.js';
import { generatePDFWithPlaywright } from './tests/playwright-test.js';
// Other libraries (PDFKit, pdfmake, pdf-lib)
// Note: html-pdf-node is in a separate service (server-html-pdf-node.js)
import { generatePDFWithPDFKit } from './tests/pdfkit-test.js';
import { generatePDFWithPDFMake } from './tests/pdfmake-test.js';
import { generatePDFWithPDFLib } from './tests/pdf-lib-test.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Library mapping
const libraries = {
  // Puppeteer and Playwright variants
  'puppeteer-base64': generatePDFWithPuppeteerBase64,
  'puppeteer-baseurl': generatePDFWithPuppeteerBaseURL,
  'playwright-base64': generatePDFWithPlaywrightBase64,
  'playwright-baseurl': generatePDFWithPlaywrightBaseURL,
  'puppeteer': generatePDFWithPuppeteer,
  'playwright': generatePDFWithPlaywright,
  // Other libraries
  'pdfkit': generatePDFWithPDFKit,
  'pdfmake': generatePDFWithPDFMake,
  'pdf-lib': generatePDFWithPDFLib
  // Note: html-pdf-node is available via separate service on port 3001
};

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    arch: process.arch,
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate PDF endpoint
 * POST /api/pdf/generate
 * Body: { library: 'puppeteer' | 'playwright' | 'pdfkit' | 'pdfmake' | 'pdf-lib', data: {...} }
 */
app.post('/api/pdf/generate', async (req, res) => {
  try {
    const { library, data } = req.body;

    if (!library) {
      return res.status(400).json({ error: 'Library name is required' });
    }

    if (!libraries[library]) {
      return res.status(400).json({
        error: `Unknown library: ${library}`,
        available: Object.keys(libraries)
      });
    }

    const startTime = Date.now();
    const result = await libraries[library](data || {});

    if (result.success) {
      // Read the generated PDF file
      const pdfBuffer = await fs.readFile(result.outputPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${library}-output.pdf"`);
      res.setHeader('X-Generation-Time', result.generationTime.toString());
      res.setHeader('X-File-Size', result.fileSize.toString());

      res.send(pdfBuffer);
    } else {
      res.status(500).json({
        error: 'PDF generation failed',
        details: result.error,
        library,
        generationTime: result.generationTime
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * List available libraries
 */
app.get('/api/pdf/libraries', (req, res) => {
  res.json({
    libraries: Object.keys(libraries).map(name => ({
      name,
      description: getLibraryDescription(name)
    }))
  });
});

function getLibraryDescription(name) {
  const descriptions = {
    // Puppeteer and Playwright variants
    'puppeteer-base64': 'Puppeteer with base64 data URIs (assets embedded)',
    'puppeteer-baseurl': 'Puppeteer with file paths using baseURL',
    'playwright-base64': 'Playwright with base64 data URIs (assets embedded)',
    'playwright-baseurl': 'Playwright with file paths using baseURL',
    'puppeteer': 'Puppeteer (original implementation with base64)',
    'playwright': 'Playwright (original implementation with base64)',
    // Other libraries
    'pdfkit': 'Pure JavaScript PDF generation library',
    'pdfmake': 'Declarative PDF generation library',
    'pdf-lib': 'Modern PDF manipulation and generation library'
    // Note: html-pdf-node is available via separate service on port 3001
  };
  return descriptions[name] || 'PDF generation library';
}

/**
 * Test endpoint - generates PDF with all libraries
 */
app.post('/api/pdf/test-all', async (req, res) => {
  try {
    const { data } = req.body;
    const results = [];

    for (const [name, fn] of Object.entries(libraries)) {
      try {
        const result = await fn(data || {});
        results.push({
          library: name,
          ...result
        });
      } catch (error) {
        results.push({
          library: name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PDF Generation API Server running on port ${PORT}`);
  console.log(`📊 Architecture: ${process.arch} on ${process.platform}`);
  console.log(`📚 Available libraries: ${Object.keys(libraries).join(', ')}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /api/pdf/libraries - List available libraries`);
  console.log(`  POST /api/pdf/generate - Generate PDF with specified library`);
  console.log(`  POST /api/pdf/test-all - Test all libraries`);
});
