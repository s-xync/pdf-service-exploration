import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * pdf-lib PDF Generation Test
 *
 * Pros:
 * - Modern, well-maintained library
 * - Pure JavaScript (excellent ARM compatibility)
 * - Good for PDF manipulation and creation
 * - TypeScript support
 *
 * Cons:
 * - Low-level API (more code for complex layouts)
 * - No HTML/CSS rendering
 * - Limited SVG support (would need conversion)
 * - Better for manipulation than generation from scratch
 */
export async function generatePDFWithPDFLib(data = {}) {
  const startTime = Date.now();

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points

    const { width, height } = page.getSize();
    const margin = 50;

    // Header
    page.drawText('Prescription Document', {
      x: margin,
      y: height - margin - 30,
      size: 24,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${data.date || new Date().toLocaleDateString()}`, {
      x: margin,
      y: height - margin - 60,
      size: 12,
    });

    // Patient Information
    page.drawText('Patient Information', {
      x: margin,
      y: height - margin - 100,
      size: 18,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${data.patientName || 'John Doe'}`, {
      x: margin,
      y: height - margin - 130,
      size: 12,
    });

    page.drawText(`DOB: ${data.patientDOB || '01/01/1990'}`, {
      x: margin,
      y: height - margin - 150,
      size: 12,
    });

    // Prescription Details
    page.drawText('Prescription Details', {
      x: margin,
      y: height - margin - 200,
      size: 18,
      color: rgb(0, 0, 0),
    });

    page.drawText(data.medicationName || 'Sample Medication', {
      x: margin,
      y: height - margin - 230,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Dosage: ${data.dosage || '10mg'}`, {
      x: margin,
      y: height - margin - 260,
      size: 12,
    });

    page.drawText(`Instructions: ${data.instructions || 'Take once daily'}`, {
      x: margin,
      y: height - margin - 280,
      size: 12,
    });

    // Note about SVG
    page.drawText('[SVG rendering requires conversion to PDF paths]', {
      x: margin,
      y: height - margin - 350,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../output/pdf-lib-test.pdf');
    await fs.writeFile(outputPath, pdfBytes);

    const generationTime = Date.now() - startTime;

    return {
      success: true,
      library: 'pdf-lib',
      generationTime,
      fileSize: pdfBytes.length,
      outputPath,
      notes: 'Modern library, low-level API, no native SVG support'
    };
  } catch (error) {
    return {
      success: false,
      library: 'pdf-lib',
      error: error.message,
      generationTime: Date.now() - startTime
    };
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  generatePDFWithPDFLib()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
