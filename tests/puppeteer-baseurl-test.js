import puppeteer from 'puppeteer';
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

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Puppeteer PDF Generation Test - Using baseURL approach
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
export async function generatePDFWithPuppeteerBaseURL(data = {}) {
  const startTime = Date.now();
  let browser = null;

  try {
    // Try to find Chromium executable (from Playwright installation)
    const chromiumPath = findChromiumPath() || process.env.PUPPETEER_EXECUTABLE_PATH;

    // Launch browser with ARM-compatible settings
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    };

    // Use Chromium if found, otherwise let Puppeteer use its default
    if (chromiumPath) {
      launchOptions.executablePath = chromiumPath;
    }

    browser = await puppeteer.launch(launchOptions);

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
      // Navigate to the file using file:// URL
      // This ensures relative paths in HTML work correctly
      const fileUrl = `file://${tempHtmlPath}`;
      await page.goto(fileUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
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
    const outputPath = path.join(__dirname, '../output/puppeteer-baseurl-test.pdf');
    await fs.writeFile(outputPath, pdfBuffer);

    return {
      success: true,
      library: 'puppeteer-baseurl',
      method: 'baseURL (file paths)',
      generationTime,
      fileSize: pdfBuffer.length,
      outputPath,
      notes: 'Using file paths with baseURL - assets must be in same directory as HTML'
    };
  } catch (error) {
    return {
      success: false,
      library: 'puppeteer-baseurl',
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
  generatePDFWithPuppeteerBaseURL()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
