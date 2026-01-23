import { generatePDFWithPuppeteer } from './tests/puppeteer-test.js';
import { generatePDFWithPlaywright } from './tests/playwright-test.js';
import { generatePDFWithPDFKit } from './tests/pdfkit-test.js';
import { generatePDFWithPDFMake } from './tests/pdfmake-test.js';
import { generatePDFWithPDFLib } from './tests/pdf-lib-test.js';
import { generatePDFWithHtmlPdfNode } from './tests/html-pdf-node-test.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testData = {
  date: new Date().toLocaleDateString(),
  patientName: 'Jane Smith',
  patientDOB: '05/15/1985',
  medicationName: 'Amoxicillin 500mg',
  dosage: '500mg',
  instructions: 'Take one capsule three times daily with meals'
};

async function runAllTests() {
  console.log('🚀 Starting PDF Generation Library Tests\n');
  console.log('='.repeat(60));

  const results = [];
  const libraries = [
    { name: 'Puppeteer', fn: generatePDFWithPuppeteer },
    { name: 'Playwright', fn: generatePDFWithPlaywright },
    { name: 'PDFKit', fn: generatePDFWithPDFKit },
    { name: 'pdfmake', fn: generatePDFWithPDFMake },
    { name: 'pdf-lib', fn: generatePDFWithPDFLib },
    { name: 'html-pdf-node', fn: generatePDFWithHtmlPdfNode }
  ];

  for (const lib of libraries) {
    console.log(`\n📦 Testing ${lib.name}...`);
    try {
      const result = await lib.fn(testData);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${lib.name} - Success`);
        console.log(`   Generation Time: ${result.generationTime}ms`);
        console.log(`   File Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
        if (result.notes) {
          console.log(`   Notes: ${result.notes}`);
        }
      } else {
        console.log(`❌ ${lib.name} - Failed`);
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${lib.name} - Exception`);
      console.log(`   Error: ${error.message}`);
      results.push({
        success: false,
        library: lib.name.toLowerCase(),
        error: error.message
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\nPerformance Comparison (Generation Time):');
    successful
      .sort((a, b) => a.generationTime - b.generationTime)
      .forEach(r => {
        console.log(`  ${r.library.padEnd(15)} ${r.generationTime.toString().padStart(6)}ms`);
      });
  }

  // Save results to file
  const resultsPath = path.join(__dirname, 'output', 'test-results.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${resultsPath}`);

  return results;
}

// Detect architecture
async function detectArchitecture() {
  const arch = process.arch;
  const platform = process.platform;
  console.log(`\n🖥️  Environment: ${platform} ${arch}\n`);
  return { arch, platform };
}

// Run tests
detectArchitecture()
  .then(() => runAllTests())
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
