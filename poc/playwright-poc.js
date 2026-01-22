import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Production-Ready Playwright PDF Generation POC
 *
 * Features:
 * - Browser instance reuse for performance
 * - Proper error handling
 * - Template support
 * - Asset handling (images, SVGs)
 * - Memory management
 */
class PlaywrightPDFGenerator {
  constructor(options = {}) {
    this.options = {
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ],
      pdfOptions: {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      },
      ...options
    };
    this.browser = null;
    this.isInitialized = false;
  }

  /**
   * Initialize browser instance (reused for all PDFs)
   */
  async initialize() {
    if (this.isInitialized && this.browser) {
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: true,
        args: this.options.browserArgs
      });
      this.isInitialized = true;
      console.log('✅ Browser instance initialized');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw new Error(`Browser initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate PDF from HTML string
   */
  async generateFromHTML(html, outputPath = null) {
    const startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const page = await this.browser.newPage();

      try {
        // Set content and wait for assets
        await page.setContent(html, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Generate PDF
        const pdfBuffer = await page.pdf(this.options.pdfOptions);

        const generationTime = Date.now() - startTime;

        // Save to file if output path provided
        if (outputPath) {
          await fs.writeFile(outputPath, pdfBuffer);
        }

        return {
          success: true,
          buffer: pdfBuffer,
          generationTime,
          fileSize: pdfBuffer.length,
          outputPath: outputPath || null
        };
      } finally {
        await page.close();
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        generationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate PDF from HTML template file with data substitution
   */
  async generateFromTemplate(templatePath, data = {}, outputPath = null) {
    try {
      // Load template
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Load and embed assets as data URIs
      const assetsDir = path.dirname(templatePath);
      const assetData = {};

      try {
        // Load test.svg
        const testSvgPath = path.join(assetsDir, 'test.svg');
        const testSvg = await fs.readFile(testSvgPath, 'utf-8');
        assetData.testSvgDataUri = `data:image/svg+xml;base64,${Buffer.from(testSvg).toString('base64')}`;
      } catch (e) {
        // Asset not found, skip
      }

      try {
        // Load logo.svg
        const logoSvgPath = path.join(assetsDir, 'logo.svg');
        const logoSvg = await fs.readFile(logoSvgPath, 'utf-8');
        assetData.logoSvgDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
      } catch (e) {
        // Asset not found, skip
      }

      try {
        // Load test-image.png
        const testImagePath = path.join(assetsDir, 'test-image.png');
        const testImage = await fs.readFile(testImagePath);
        assetData.testImageDataUri = `data:image/png;base64,${testImage.toString('base64')}`;
      } catch (e) {
        // Asset not found, skip
      }

      // Merge data with asset data
      const mergedData = { ...data, ...assetData };

      // Simple template substitution (can be replaced with Handlebars, etc.)
      const html = this.substituteTemplate(templateContent, mergedData);

      return await this.generateFromHTML(html, outputPath);
    } catch (error) {
      return {
        success: false,
        error: `Template processing failed: ${error.message}`,
        generationTime: 0
      };
    }
  }

  /**
   * Simple template substitution (replace {{variable}} with data)
   */
  substituteTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Cleanup browser instance
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      console.log('✅ Browser instance closed');
    }
  }

  /**
   * Health check - verify browser is working
   */
  async healthCheck() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const page = await this.browser.newPage();
      await page.setContent('<html><body><h1>Test</h1></body></html>');
      const pdf = await page.pdf({ format: 'A4' });
      await page.close();

      return {
        healthy: true,
        browserVersion: this.browser.version(),
        testPdfSize: pdf.length
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
let generatorInstance = null;

export function getPDFGenerator(options) {
  if (!generatorInstance) {
    generatorInstance = new PlaywrightPDFGenerator(options);
  }
  return generatorInstance;
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = getPDFGenerator();

  const testData = {
    date: new Date().toLocaleDateString(),
    patientName: 'Jane Smith',
    patientDOB: '05/15/1985',
    medicationName: 'Amoxicillin 500mg',
    dosage: '500mg',
    instructions: 'Take one capsule three times daily with meals'
  };

  (async () => {
    try {
      // Health check
      console.log('Running health check...');
      const health = await generator.healthCheck();
      console.log('Health:', health);

      // Generate PDF from template
      const templatePath = path.join(__dirname, '../assets/sample-html.html');
      const outputPath = path.join(__dirname, '../output/poc-playwright.pdf');

      console.log('\nGenerating PDF...');
      const result = await generator.generateFromTemplate(
        templatePath,
        testData,
        outputPath
      );

      if (result.success) {
        console.log('✅ PDF generated successfully!');
        console.log(`   Time: ${result.generationTime}ms`);
        console.log(`   Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
        console.log(`   Path: ${result.outputPath}`);
      } else {
        console.error('❌ PDF generation failed:', result.error);
      }

      // Cleanup
      await generator.cleanup();
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

export default PlaywrightPDFGenerator;
