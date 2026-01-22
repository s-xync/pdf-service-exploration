import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright PDF Generation Test
 *
 * Pros:
 * - Excellent HTML/CSS/SVG rendering (multiple browser engines)
 * - Better cross-browser support than Puppeteer
 * - Modern API and active maintenance
 * - Good ARM support
 *
 * Cons:
 * - Requires browser binaries (larger Docker image)
 * - More resource-intensive
 * - Slightly newer than Puppeteer (less legacy support)
 */
export async function generatePDFWithPlaywrightBase64(data = {}) {
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

    // Set content and wait for assets to load
    await page.setContent(html, { waitUntil: 'networkidle' });

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
    const outputPath = path.join(__dirname, '../output/playwright-base64-test.pdf');
    await fs.writeFile(outputPath, pdfBuffer);

    return {
      success: true,
      library: 'playwright-base64',
      method: 'base64 (data URIs)',
      generationTime,
      fileSize: pdfBuffer.length,
      outputPath,
      notes: 'Using base64 data URIs - assets embedded in HTML'
    };
  } catch (error) {
    return {
      success: false,
      library: 'playwright-base64',
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
  generatePDFWithPlaywrightBase64()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
