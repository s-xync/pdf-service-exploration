import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * pdf-lib PDF Generation Test with Image Support
 *
 * Image Support:
 * - ✅ PNG images via embedPng()
 * - ✅ JPG/JPEG images via embedJpg()
 * - ❌ SVG requires conversion to PNG first (no native SVG support)
 *
 * Pros:
 * - Modern, well-maintained library
 * - Pure JavaScript (excellent ARM compatibility)
 * - Good for PDF manipulation and creation
 * - TypeScript support
 * - Native PNG/JPG support
 *
 * Cons:
 * - Low-level API (more code for complex layouts)
 * - No HTML/CSS rendering
 * - No native SVG support (would need SVG to PNG conversion)
 * - Better for manipulation than generation from scratch
 */
export async function generatePDFWithPDFLib(data = {}) {
  const startTime = Date.now();

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points

    const { width, height } = page.getSize();
    const margin = 50;
    let currentY = height - margin;

    // Header
    page.drawText('Prescription Document', {
      x: margin,
      y: currentY,
      size: 24,
      color: rgb(0, 0, 0),
    });
    currentY -= 40;

    page.drawText(`Date: ${data.date || new Date().toLocaleDateString()}`, {
      x: margin,
      y: currentY,
      size: 12,
    });
    currentY -= 40;

    // Patient Information
    page.drawText('Patient Information', {
      x: margin,
      y: currentY,
      size: 18,
      color: rgb(0, 0, 0),
    });
    currentY -= 30;

    page.drawText(`Name: ${data.patientName || 'John Doe'}`, {
      x: margin,
      y: currentY,
      size: 12,
    });
    currentY -= 20;

    page.drawText(`DOB: ${data.patientDOB || '01/01/1990'}`, {
      x: margin,
      y: currentY,
      size: 12,
    });
    currentY -= 40;

    // Prescription Details
    page.drawText('Prescription Details', {
      x: margin,
      y: currentY,
      size: 18,
      color: rgb(0, 0, 0),
    });
    currentY -= 30;

    page.drawText(data.medicationName || 'Sample Medication', {
      x: margin,
      y: currentY,
      size: 14,
      color: rgb(0, 0, 0),
    });
    currentY -= 20;

    page.drawText(`Dosage: ${data.dosage || '10mg'}`, {
      x: margin,
      y: currentY,
      size: 12,
    });
    currentY -= 20;

    page.drawText(`Instructions: ${data.instructions || 'Take once daily'}`, {
      x: margin,
      y: currentY,
      size: 12,
    });
    currentY -= 50;

    // Image Support Section
    page.drawText('Image Support (pdf-lib)', {
      x: margin,
      y: currentY,
      size: 18,
      color: rgb(0, 0, 0),
    });
    currentY -= 30;

    const assetsDir = path.join(__dirname, '../assets');

    // Embed PNG Image
    try {
      const pngPath = path.join(assetsDir, 'test-image-png.png');

      // Check if file exists
      try {
        await fs.access(pngPath);
      } catch (accessError) {
        throw new Error(`PNG file not found at ${pngPath}`);
      }

      const pngImageBytes = await fs.readFile(pngPath);
      console.log(`[pdf-lib] PNG file read: ${pngImageBytes.length} bytes`);

      const pngImage = await pdfDoc.embedPng(pngImageBytes);
      console.log(`[pdf-lib] PNG embedded successfully`);

      page.drawText('PNG Image (embedded):', {
        x: margin,
        y: currentY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;

      // Draw PNG image - use actual dimensions with proper scaling
      // pdf-lib images have width and height properties directly
      const maxWidth = 150;
      const originalWidth = pngImage.width;
      const originalHeight = pngImage.height;
      const scaleFactor = maxWidth / originalWidth;
      const scaledWidth = originalWidth * scaleFactor;
      const scaledHeight = originalHeight * scaleFactor;

      // In pdf-lib, Y coordinate is from bottom (0 is bottom of page)
      const imageY = currentY - scaledHeight;

      console.log(`[pdf-lib] PNG original: ${originalWidth}x${originalHeight}, scaled: ${scaledWidth}x${scaledHeight}`);
      console.log(`[pdf-lib] Drawing PNG at x=${margin}, y=${imageY}, currentY=${currentY}, page height=${height}`);

      // Check if image would fit on page (need at least margin space at bottom)
      if (imageY < margin) {
        console.warn(`[pdf-lib] PNG would be off-page (y=${imageY} < margin=${margin}), adding new page`);
        page = pdfDoc.addPage([595, 842]);
        currentY = height - margin;
        const newImageY = currentY - scaledHeight;
        page.drawImage(pngImage, {
          x: margin,
          y: newImageY,
          width: scaledWidth,
          height: scaledHeight,
        });
        currentY = newImageY - 20;
      } else {
        page.drawImage(pngImage, {
          x: margin,
          y: imageY,
          width: scaledWidth,
          height: scaledHeight,
        });
        currentY = imageY - 20;
      }
      console.log(`[pdf-lib] PNG drawn successfully, new currentY=${currentY}`);
      console.log(`[pdf-lib] PNG drawn successfully`);
    } catch (error) {
      console.error(`[pdf-lib] PNG Error:`, error);
      page.drawText(`PNG Error: ${error.message}`, {
        x: margin,
        y: currentY,
        size: 10,
        color: rgb(1, 0, 0),
      });
      currentY -= 20;
    }

    // Embed JPG Image
    try {
      const jpgPath = path.join(assetsDir, 'test-image-jpg.jpg');

      // Check if file exists
      try {
        await fs.access(jpgPath);
      } catch (accessError) {
        throw new Error(`JPG file not found at ${jpgPath}`);
      }

      const jpgImageBytes = await fs.readFile(jpgPath);
      console.log(`[pdf-lib] JPG file read: ${jpgImageBytes.length} bytes`);

      const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
      console.log(`[pdf-lib] JPG embedded successfully`);

      page.drawText('JPG Image (embedded):', {
        x: margin,
        y: currentY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;

      // Draw JPG image - use actual dimensions with proper scaling
      const maxWidth = 150;
      const originalWidth = jpgImage.width;
      const originalHeight = jpgImage.height;
      const scaleFactor = maxWidth / originalWidth;
      const scaledWidth = originalWidth * scaleFactor;
      const scaledHeight = originalHeight * scaleFactor;

      // In pdf-lib, Y coordinate is from bottom (0 is bottom of page)
      const imageY = currentY - scaledHeight;

      console.log(`[pdf-lib] JPG original: ${originalWidth}x${originalHeight}, scaled: ${scaledWidth}x${scaledHeight}`);
      console.log(`[pdf-lib] Drawing JPG at x=${margin}, y=${imageY}, currentY=${currentY}, page height=${height}`);

      // Check if image would fit on page
      if (imageY < margin) {
        console.warn(`[pdf-lib] JPG would be off-page (y=${imageY} < margin=${margin}), adding new page`);
        page = pdfDoc.addPage([595, 842]);
        currentY = height - margin;
        const newImageY = currentY - scaledHeight;
        page.drawImage(jpgImage, {
          x: margin,
          y: newImageY,
          width: scaledWidth,
          height: scaledHeight,
        });
        currentY = newImageY - 20;
      } else {
        page.drawImage(jpgImage, {
          x: margin,
          y: imageY,
          width: scaledWidth,
          height: scaledHeight,
        });
        currentY = imageY - 20;
      }
      console.log(`[pdf-lib] JPG drawn successfully, new currentY=${currentY}`);
      console.log(`[pdf-lib] JPG drawn successfully`);
    } catch (error) {
      console.error(`[pdf-lib] JPG Error:`, error);
      page.drawText(`JPG Error: ${error.message}`, {
        x: margin,
        y: currentY,
        size: 10,
        color: rgb(1, 0, 0),
      });
      currentY -= 20;
    }

    // SVG Note
    page.drawText('SVG Support:', {
      x: margin,
      y: currentY,
      size: 12,
      color: rgb(0, 0, 0),
    });
    currentY -= 20;

    page.drawText('SVG requires conversion to PNG first (no native SVG support)', {
      x: margin,
      y: currentY,
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
      notes: 'Native PNG/JPG support via embedPng() and embedJpg(). SVG requires conversion to PNG first.'
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
