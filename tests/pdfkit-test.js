import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PDFKit PDF Generation Test
 *
 * Pros:
 * - Pure JavaScript (no external binaries)
 * - Lightweight and fast
 * - Good for programmatic PDF creation
 * - Excellent ARM compatibility (pure JS)
 *
 * Cons:
 * - Limited HTML/CSS support (no HTML rendering)
 * - Manual layout required
 * - SVG support requires additional libraries
 * - More code needed for complex layouts
 */
export async function generatePDFWithPDFKit(data = {}) {
  const startTime = Date.now();

  try {
    const outputPath = path.join(__dirname, '../output/pdfkit-test.pdf');
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 }
    });

    const stream = (await import('fs')).createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24)
       .text('Prescription Document', { align: 'center' })
       .moveDown();

    doc.fontSize(12)
       .text(`Date: ${data.date || new Date().toLocaleDateString()}`)
       .moveDown(0.5);

    // Patient Information
    doc.fontSize(18)
       .text('Patient Information', { underline: true })
       .moveDown(0.5);

    doc.fontSize(12)
       .text(`Name: ${data.patientName || 'John Doe'}`)
       .text(`DOB: ${data.patientDOB || '01/01/1990'}`)
       .moveDown();

    // Prescription Details
    doc.fontSize(18)
       .text('Prescription Details', { underline: true })
       .moveDown(0.5);

    doc.fontSize(14)
       .text(data.medicationName || 'Sample Medication', { bold: true })
       .moveDown(0.3);

    doc.fontSize(12)
       .text(`Dosage: ${data.dosage || '10mg'}`)
       .text(`Instructions: ${data.instructions || 'Take once daily'}`)
       .moveDown();

    // Note: PDFKit doesn't natively support SVG rendering
    // Would need svg-to-pdfkit or similar library
    doc.fontSize(10)
       .fillColor('gray')
       .text('[SVG rendering requires additional library]', { italic: true });

    doc.end();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const stats = await fs.stat(outputPath);
    const generationTime = Date.now() - startTime;

    return {
      success: true,
      library: 'pdfkit',
      generationTime,
      fileSize: stats.size,
      outputPath,
      notes: 'Pure JS library, no SVG support without additional libraries'
    };
  } catch (error) {
    return {
      success: false,
      library: 'pdfkit',
      error: error.message,
      generationTime: Date.now() - startTime
    };
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  generatePDFWithPDFKit()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
