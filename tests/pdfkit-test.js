import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import SVGtoPDF from 'svg-to-pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PDFKit PDF Generation Test with Image and SVG Support
 *
 * Image Support:
 * - ✅ PNG images via doc.image() with file path or buffer
 * - ✅ JPG/JPEG images via doc.image() with file path or buffer
 *
 * SVG Support:
 * - ✅ SVG via svg-to-pdfkit library
 * - Supports most SVG features: paths, shapes, text, gradients, etc.
 *
 * Pros:
 * - Pure JavaScript (no external binaries)
 * - Lightweight and fast
 * - Good for programmatic PDF creation
 * - Excellent ARM compatibility (pure JS)
 * - Native image support (PNG, JPG)
 * - SVG support via svg-to-pdfkit library
 *
 * Cons:
 * - Limited HTML/CSS support (no HTML rendering)
 * - Manual layout required
 * - SVG requires additional library (svg-to-pdfkit)
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

    // Image Support Section
    doc.fontSize(18)
       .text('Image Support (PDFKit)', { underline: true })
       .moveDown(0.5);

    const assetsDir = path.join(__dirname, '../assets');

    // Add PNG Image
    try {
      const pngPath = path.join(assetsDir, 'test-image-png.png');

      // Check if file exists
      try {
        await fs.access(pngPath);
      } catch (accessError) {
        throw new Error(`PNG file not found at ${pngPath}`);
      }

      console.log(`[pdfkit] Loading PNG from: ${pngPath}`);
      doc.fontSize(12)
         .text('PNG Image:', { continued: false })
         .moveDown(0.3);

      doc.image(pngPath, {
        fit: [150, 150],
        align: 'left'
      });
      console.log(`[pdfkit] PNG image added successfully`);
      doc.moveDown();
    } catch (error) {
      console.error(`[pdfkit] PNG Error:`, error);
      doc.fontSize(10)
         .fillColor('red')
         .text(`PNG Error: ${error.message}`)
         .fillColor('black')
         .moveDown();
    }

    // Add JPG Image
    try {
      const jpgPath = path.join(assetsDir, 'test-image-jpg.jpg');

      // Check if file exists
      try {
        await fs.access(jpgPath);
      } catch (accessError) {
        throw new Error(`JPG file not found at ${jpgPath}`);
      }

      console.log(`[pdfkit] Loading JPG from: ${jpgPath}`);
      doc.fontSize(12)
         .text('JPG Image:', { continued: false })
         .moveDown(0.3);

      doc.image(jpgPath, {
        fit: [150, 150],
        align: 'left'
      });
      console.log(`[pdfkit] JPG image added successfully`);
      doc.moveDown();
    } catch (error) {
      console.error(`[pdfkit] JPG Error:`, error);
      doc.fontSize(10)
         .fillColor('red')
         .text(`JPG Error: ${error.message}`)
         .fillColor('black')
         .moveDown();
    }

    // SVG Support Section
    doc.fontSize(18)
       .text('SVG Support (via svg-to-pdfkit)', { underline: true })
       .moveDown(0.5);

    // Add SVG from file
    try {
      const svgPath = path.join(assetsDir, 'test-svg-svg.svg');

      // Check if file exists
      try {
        await fs.access(svgPath);
      } catch (accessError) {
        throw new Error(`SVG file not found at ${svgPath}`);
      }

      const svgContent = await fs.readFile(svgPath, 'utf-8');
      console.log(`[pdfkit] SVG file read: ${svgContent.length} chars`);

      doc.fontSize(12)
         .text('SVG Image (from file):', { continued: false })
         .moveDown(0.3);

      const svgY = doc.y;
      console.log(`[pdfkit] Rendering SVG at y=${svgY}`);

      // Use svg-to-pdfkit to render SVG
      SVGtoPDF(doc, svgContent, 20, svgY, {
        width: 150,
        height: 150
      });

      console.log(`[pdfkit] SVG rendered successfully`);
      doc.y += 160; // Move down after SVG
      doc.moveDown();
    } catch (error) {
      console.error(`[pdfkit] SVG Error:`, error);
      doc.fontSize(10)
         .fillColor('red')
         .text(`SVG Error: ${error.message}`)
         .fillColor('black')
         .moveDown();
    }

    // Add another SVG (logo)
    try {
      const logoSvgPath = path.join(assetsDir, 'test-svg-logo.svg');

      // Check if file exists
      try {
        await fs.access(logoSvgPath);
      } catch (accessError) {
        throw new Error(`SVG logo file not found at ${logoSvgPath}`);
      }

      const logoSvgContent = await fs.readFile(logoSvgPath, 'utf-8');
      console.log(`[pdfkit] SVG logo file read: ${logoSvgContent.length} chars`);

      doc.fontSize(12)
         .text('SVG Logo (from file):', { continued: false })
         .moveDown(0.3);

      const logoSvgY = doc.y;
      console.log(`[pdfkit] Rendering SVG logo at y=${logoSvgY}`);

      SVGtoPDF(doc, logoSvgContent, 20, logoSvgY, {
        width: 150,
        height: 150
      });

      console.log(`[pdfkit] SVG logo rendered successfully`);
      doc.y += 160;
    } catch (error) {
      console.error(`[pdfkit] SVG Logo Error:`, error);
      doc.fontSize(10)
         .fillColor('red')
         .text(`SVG Logo Error: ${error.message}`)
         .fillColor('black');
    }

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
      notes: 'Native PNG/JPG support. SVG support via svg-to-pdfkit library.'
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
