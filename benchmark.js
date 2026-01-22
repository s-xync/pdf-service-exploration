import { generatePDFWithPuppeteer } from './tests/puppeteer-test.js';
import { generatePDFWithPlaywright } from './tests/playwright-test.js';
import { generatePDFWithPDFKit } from './tests/pdfkit-test.js';
import { generatePDFWithPDFMake } from './tests/pdfmake-test.js';
import { generatePDFWithPDFLib } from './tests/pdf-lib-test.js';
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

async function benchmark(libraryFn, libraryName, iterations = 5) {
  console.log(`\n⏱️  Benchmarking ${libraryName} (${iterations} iterations)...`);

  const times = [];
  const fileSizes = [];
  let errors = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const result = await libraryFn(testData);
      if (result.success) {
        times.push(result.generationTime);
        fileSizes.push(result.fileSize);
      } else {
        errors++;
      }
    } catch (error) {
      errors++;
    }
  }

  if (times.length === 0) {
    return {
      library: libraryName,
      success: false,
      error: 'All iterations failed'
    };
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const avgFileSize = fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length;

  return {
    library: libraryName,
    success: true,
    iterations: times.length,
    errors,
    avgTime: Math.round(avgTime),
    minTime,
    maxTime,
    avgFileSize: Math.round(avgFileSize),
    avgFileSizeKB: (avgFileSize / 1024).toFixed(2)
  };
}

async function runBenchmarks() {
  console.log('🏃 Starting PDF Generation Benchmarks\n');
  console.log('='.repeat(70));

  const libraries = [
    { name: 'Puppeteer', fn: generatePDFWithPuppeteer },
    { name: 'Playwright', fn: generatePDFWithPlaywright },
    { name: 'PDFKit', fn: generatePDFWithPDFKit },
    { name: 'pdfmake', fn: generatePDFWithPDFMake },
    { name: 'pdf-lib', fn: generatePDFWithPDFLib }
  ];

  const results = [];

  for (const lib of libraries) {
    const result = await benchmark(lib.fn, lib.name, 5);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${lib.name}`);
      console.log(`   Avg Time: ${result.avgTime}ms (min: ${result.minTime}ms, max: ${result.maxTime}ms)`);
      console.log(`   Avg File Size: ${result.avgFileSizeKB} KB`);
      console.log(`   Success Rate: ${result.iterations}/5`);
    } else {
      console.log(`❌ ${lib.name} - ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Benchmark Summary\n');

  const successful = results.filter(r => r.success);

  if (successful.length > 0) {
    console.log('Performance Ranking (by average generation time):');
    successful
      .sort((a, b) => a.avgTime - b.avgTime)
      .forEach((r, index) => {
        console.log(`  ${index + 1}. ${r.library.padEnd(15)} ${r.avgTime.toString().padStart(6)}ms avg`);
      });

    console.log('\nFile Size Comparison:');
    successful
      .sort((a, b) => a.avgFileSize - b.avgFileSize)
      .forEach((r, index) => {
        console.log(`  ${index + 1}. ${r.library.padEnd(15)} ${r.avgFileSizeKB.padStart(8)} KB`);
      });
  }

  // Save benchmark results
  const resultsPath = path.join(__dirname, 'output', 'benchmark-results.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Benchmark results saved to: ${resultsPath}`);

  return results;
}

// Run benchmarks
runBenchmarks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
