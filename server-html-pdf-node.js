import express from 'express';
import { generatePDFWithHtmlPdfNode } from './tests/html-pdf-node-test.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'html-pdf-node',
    arch: process.arch,
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate PDF endpoint
 * POST /api/pdf/generate
 * Body: { data: {...} }
 */
app.post('/api/pdf/generate', async (req, res) => {
  try {
    const { data } = req.body;

    const startTime = Date.now();
    const result = await generatePDFWithHtmlPdfNode(data || {});

    if (result.success) {
      // Read the generated PDF file
      const pdfBuffer = await fs.readFile(result.outputPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="html-pdf-node-output.pdf"');
      res.setHeader('X-Generation-Time', result.generationTime.toString());
      res.setHeader('X-File-Size', result.fileSize.toString());

      res.send(pdfBuffer);
    } else {
      res.status(500).json({
        error: 'PDF generation failed',
        details: result.error,
        library: 'html-pdf-node',
        generationTime: result.generationTime,
        debug: result.debug
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
 * Library info endpoint
 */
app.get('/api/pdf/library', (req, res) => {
  res.json({
    library: 'html-pdf-node',
    description: 'HTML to PDF converter using Chromium (wrapper around Puppeteer)',
    version: '1.0.8'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HTML-PDF-Node Service running on port ${PORT}`);
  console.log(`📊 Architecture: ${process.arch} on ${process.platform}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /api/pdf/library - Library information`);
  console.log(`  POST /api/pdf/generate - Generate PDF`);
});
