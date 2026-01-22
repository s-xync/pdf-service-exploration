import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright PDF Generation Test - Using baseURL approach
 *
 * This variant uses file paths with baseURL instead of base64 encoding.
 * Assets must be in the same directory as the HTML template.
 *
 * Pros:
 * - No base64 encoding overhead
 * - Smaller HTML size
 * - Better performance
 * - Cleaner HTML
 *
 * Requirements:
 * - Assets must be in the same directory as HTML template
 * - Use relative paths in HTML: <img src="test.svg" />
 */
export async function generatePDFWithPlaywrightBaseURL(data = {}) {
  const startTime = Date.now();
  let browser = null;

  try {
    // Launch browser with ARM-compatible settings
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    // Load HTML template
    const htmlPath = path.join(__dirname, '../assets/sample-html-baseurl.html');
    let html = await fs.readFile(htmlPath, 'utf-8');

    // Get assets directory (same as HTML template directory)
    const assetsDir = path.dirname(htmlPath);

    // Replace template variables (no asset loading needed - using file paths)
    html = html
      .replace('{{date}}', data.date || new Date().toLocaleDateString())
      .replace('{{patientName}}', data.patientName || 'John Doe')
      .replace('{{patientDOB}}', data.patientDOB || '01/01/1990')
      .replace('{{medicationName}}', data.medicationName || 'Sample Medication')
      .replace('{{dosage}}', data.dosage || '10mg')
      .replace('{{instructions}}', data.instructions || 'Take once daily');

    // Save HTML to a temporary file in the assets directory
    // This allows file:// URLs to work properly with relative paths
    const tempHtmlPath = path.join(assetsDir, 'temp-template.html');
    await fs.writeFile(tempHtmlPath, html);

    try {
      // Navigate to the file using file:// URL with absolute path
      // Use path.resolve to ensure absolute path for file:// protocol
      const absolutePath = path.resolve(tempHtmlPath);
      // On Windows, file:// URLs need forward slashes
      const fileUrl = process.platform === 'win32'
        ? `file:///${absolutePath.replace(/\\/g, '/')}`
        : `file://${absolutePath}`;

      await page.goto(fileUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait a bit more to ensure images are loaded
      await page.waitForTimeout(1000);
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempHtmlPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    const generationTime = Date.now() - startTime;

    // Save to output directory
    const outputPath = path.join(__dirname, '../output/playwright-baseurl-test.pdf');
    await fs.writeFile(outputPath, pdfBuffer);

    return {
      success: true,
      library: 'playwright-baseurl',
      method: 'baseURL (file paths)',
      generationTime,
      fileSize: pdfBuffer.length,
      outputPath,
      notes: 'Using file paths with baseURL - assets must be in same directory as HTML'
    };
  } catch (error) {
    return {
      success: false,
      library: 'playwright-baseurl',
      error: error.message,
      generationTime: Date.now() - startTime
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  generatePDFWithPlaywrightBaseURL()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
