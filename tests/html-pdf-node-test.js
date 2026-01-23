import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find Playwright's Chromium executable path
 */
function findChromiumPath() {
  // First check environment variable
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const homeDir = os.homedir();

    // Try to find using find command (works in Docker/Linux)
    try {
      const result = execSync(
        `find ${homeDir}/.cache/ms-playwright -name "chrome" -type f 2>/dev/null | head -1`,
        { encoding: 'utf-8', timeout: 2000 }
      ).trim();
      if (result && fsSync.existsSync(result)) {
        return result;
      }
    } catch (e) {
      // Fallback: check common location manually
      try {
        const dir = path.join(homeDir, '.cache/ms-playwright');
        if (fsSync.existsSync(dir)) {
          const entries = fsSync.readdirSync(dir);
          for (const entry of entries) {
            if (entry.startsWith('chromium-')) {
              const chromePath = path.join(dir, entry, 'chrome-linux/chrome');
              if (fsSync.existsSync(chromePath)) {
                return chromePath;
              }
            }
          }
        }
      } catch (e) {}
    }

    // Check common system locations for chromium-browser
    const systemPaths = [
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable'
    ];

    for (const systemPath of systemPaths) {
      if (fsSync.existsSync(systemPath)) {
        return systemPath;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Set PUPPETEER_EXECUTABLE_PATH at module load time, before html-pdf-node imports Puppeteer
// This ensures the environment variable is set before Puppeteer initializes
const chromiumPath = findChromiumPath();
if (chromiumPath && fsSync.existsSync(chromiumPath)) {
  process.env.PUPPETEER_EXECUTABLE_PATH = chromiumPath;
}

/**
 * html-pdf-node PDF Generation Test
 *
 * Pros:
 * - Simple API for HTML to PDF conversion
 * - Uses Chromium under the hood (good rendering)
 * - Supports both HTML content and URLs
 * - Lightweight wrapper around Puppeteer
 *
 * Cons:
 * - Requires Chromium binary (larger Docker image)
 * - Less control compared to direct Puppeteer usage
 * - ARM support depends on Chromium installation
 */
export async function generatePDFWithHtmlPdfNode(data = {}) {
  const startTime = Date.now();

  try {
    // Find Chromium executable path (html-pdf-node uses Puppeteer internally)
    const chromiumPath = findChromiumPath() || process.env.PUPPETEER_EXECUTABLE_PATH;

    // Set environment variable for Puppeteer to use (html-pdf-node respects this)
    // This must be set before Puppeteer tries to launch
    if (chromiumPath) {
      // Verify the path exists and is executable
      if (fsSync.existsSync(chromiumPath)) {
        process.env.PUPPETEER_EXECUTABLE_PATH = chromiumPath;
      } else {
        console.warn(`Chromium path found but does not exist: ${chromiumPath}`);
      }
    } else {
      console.warn('Chromium executable not found. html-pdf-node may fail to launch browser.');
    }

    // Dynamically import html-pdf-node AFTER setting the environment variable
    // This ensures Puppeteer (used internally by html-pdf-node) picks up the correct path
    const { generatePdf } = await import('html-pdf-node');
    // Load HTML template
    const htmlPath = path.join(__dirname, '../assets/sample-html.html');
    let html = await fs.readFile(htmlPath, 'utf-8');

    // Load and convert assets to data URIs
    const assetsDir = path.join(__dirname, '../assets');

    // Load test-svg-svg.svg and convert to data URI
    const testSvgSvgPath = path.join(assetsDir, 'test-svg-svg.svg');
    const testSvgSvg = await fs.readFile(testSvgSvgPath, 'utf-8');
    const testSvgSvgDataUri = `data:image/svg+xml;base64,${Buffer.from(testSvgSvg).toString('base64')}`;

    // Load test-svg-logo.svg and convert to data URI
    const testSvgLogoPath = path.join(assetsDir, 'test-svg-logo.svg');
    const testSvgLogo = await fs.readFile(testSvgLogoPath, 'utf-8');
    const testSvgLogoDataUri = `data:image/svg+xml;base64,${Buffer.from(testSvgLogo).toString('base64')}`;

    // Load test-image-png.png and convert to data URI
    const testImagePngPath = path.join(assetsDir, 'test-image-png.png');
    const testImagePng = await fs.readFile(testImagePngPath);
    const testImagePngDataUri = `data:image/png;base64,${testImagePng.toString('base64')}`;

    // Load test-image-jpg.jpg and convert to data URI
    const testImageJpgPath = path.join(assetsDir, 'test-image-jpg.jpg');
    const testImageJpg = await fs.readFile(testImageJpgPath);
    const testImageJpgDataUri = `data:image/jpeg;base64,${testImageJpg.toString('base64')}`;

    // Replace template variables
    html = html
      .replace('{{date}}', data.date || new Date().toLocaleDateString())
      .replace('{{patientName}}', data.patientName || 'John Doe')
      .replace('{{patientDOB}}', data.patientDOB || '01/01/1990')
      .replace('{{medicationName}}', data.medicationName || 'Sample Medication')
      .replace('{{dosage}}', data.dosage || '10mg')
      .replace('{{instructions}}', data.instructions || 'Take once daily')
      .replace('{{testSvgSvgDataUri}}', testSvgSvgDataUri)
      .replace('{{testSvgLogoDataUri}}', testSvgLogoDataUri)
      .replace('{{testImagePngDataUri}}', testImagePngDataUri)
      .replace('{{testImageJpgDataUri}}', testImageJpgDataUri);

    // Prepare file object with HTML content
    const file = { content: html };

    // PDF generation options
    const options = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    // html-pdf-node should respect PUPPETEER_EXECUTABLE_PATH environment variable
    // Some versions may also support executablePath in options, but it's not guaranteed
    // The environment variable approach is more reliable
    if (chromiumPath) {
      // Try to pass executablePath if html-pdf-node supports it (passes through to Puppeteer)
      // Note: This may not work with all versions of html-pdf-node
      options.executablePath = chromiumPath;
    }

    // Generate PDF
    const pdfBuffer = await generatePdf(file, options);

    const generationTime = Date.now() - startTime;

    // Save to output directory
    const outputPath = path.join(__dirname, '../output/html-pdf-node-test.pdf');
    await fs.writeFile(outputPath, pdfBuffer);

    return {
      success: true,
      library: 'html-pdf-node',
      generationTime,
      fileSize: pdfBuffer.length,
      outputPath,
      notes: 'Successfully generated PDF with embedded SVG and images'
    };
  } catch (error) {
    const chromiumPath = findChromiumPath();
    return {
      success: false,
      library: 'html-pdf-node',
      error: error.message,
      generationTime: Date.now() - startTime,
      debug: {
        chromiumPath: chromiumPath || 'not found',
        puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'not set'
      }
    };
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  generatePDFWithHtmlPdfNode()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
