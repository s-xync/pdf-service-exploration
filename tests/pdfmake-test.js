import PdfPrinter from 'pdfmake';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * pdfmake PDF Generation Test with Image Support
 *
 * Image Support:
 * - ✅ PNG images via base64 data URIs or file paths
 * - ✅ JPG/JPEG images via base64 data URIs or file paths
 * - ❌ SVG requires conversion to PNG first (no native SVG support)
 *
 * Pros:
 * - Declarative API (JSON-like structure)
 * - Good for structured documents
 * - Supports images via base64 or file paths
 * - Pure JavaScript (good ARM compatibility)
 *
 * Cons:
 * - Limited HTML/CSS support
 * - No native SVG support (would need SVG to PNG conversion)
 * - Requires learning pdfmake's document structure
 * - Less flexible for complex layouts
 */
export async function generatePDFWithPDFMake(data = {}) {
  const startTime = Date.now();

  try {
    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const assetsDir = path.join(__dirname, '../assets');
    const images = {};

    // Load PNG image - pdfmake supports both file paths and base64 in Node.js
    // Using file paths is more efficient in Node.js
    try {
      const pngPath = path.join(assetsDir, 'test-image-png.png');

      // Check if file exists
      try {
        await fs.access(pngPath);
      } catch (accessError) {
        throw new Error(`PNG file not found at ${pngPath}`);
      }

      // Try file path first (more efficient in Node.js)
      images.pngImage = pngPath;
      console.log(`[pdfmake] PNG image path: ${pngPath}`);

      // Also try base64 as fallback
      const pngBuffer = await fs.readFile(pngPath);
      console.log(`[pdfmake] PNG file read: ${pngBuffer.length} bytes`);
      images.pngImageBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      console.log(`[pdfmake] PNG base64 prepared as fallback`);
    } catch (error) {
      console.error('[pdfmake] Failed to load PNG image:', error.message);
      console.error('[pdfmake] Error stack:', error.stack);
    }

    // Load JPG image
    try {
      const jpgPath = path.join(assetsDir, 'test-image-jpg.jpg');

      // Check if file exists
      try {
        await fs.access(jpgPath);
      } catch (accessError) {
        throw new Error(`JPG file not found at ${jpgPath}`);
      }

      // Try file path first (more efficient in Node.js)
      images.jpgImage = jpgPath;
      console.log(`[pdfmake] JPG image path: ${jpgPath}`);

      // Also try base64 as fallback
      const jpgBuffer = await fs.readFile(jpgPath);
      console.log(`[pdfmake] JPG file read: ${jpgBuffer.length} bytes`);
      images.jpgImageBase64 = `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
      console.log(`[pdfmake] JPG base64 prepared as fallback`);
    } catch (error) {
      console.error('[pdfmake] Failed to load JPG image:', error.message);
      console.error('[pdfmake] Error stack:', error.stack);
    }

    const printer = new PdfPrinter(fonts);

    const content = [
      { text: 'Prescription Document', style: 'header', alignment: 'center' },
      { text: `Date: ${data.date || new Date().toLocaleDateString()}`, margin: [0, 10, 0, 10] },
      { text: 'Patient Information', style: 'subheader' },
      { text: `Name: ${data.patientName || 'John Doe'}` },
      { text: `DOB: ${data.patientDOB || '01/01/1990'}` },
      { text: 'Prescription Details', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: data.medicationName || 'Sample Medication',
                bold: true,
                margin: [10, 10, 10, 5]
              }
            ],
            [
              {
                text: `Dosage: ${data.dosage || '10mg'}\nInstructions: ${data.instructions || 'Take once daily'}`,
                margin: [10, 5, 10, 10]
              }
            ]
          ]
        },
        layout: 'noBorders',
        fillColor: '#f5f5f5'
      },
      { text: 'Image Support (pdfmake)', style: 'subheader', margin: [0, 20, 0, 10] }
    ];

    // Add PNG image if available
    if (images.pngImage) {
      console.log(`[pdfmake] Adding PNG image to content`);
      content.push(
        { text: 'PNG Image:', margin: [0, 10, 0, 5] },
        {
          image: 'pngImage',
          width: 150,
          margin: [0, 0, 0, 10]
        }
      );
    } else {
      console.warn('[pdfmake] PNG image not available');
    }

    // Add JPG image if available
    if (images.jpgImage) {
      console.log(`[pdfmake] Adding JPG image to content`);
      content.push(
        { text: 'JPG Image:', margin: [0, 10, 0, 5] },
        {
          image: 'jpgImage',
          width: 150,
          margin: [0, 0, 0, 10]
        }
      );
    } else {
      console.warn('[pdfmake] JPG image not available');
    }

    // SVG note
    content.push({
      text: 'SVG Support: SVG requires conversion to PNG first (no native SVG support)',
      italics: true,
      color: 'gray',
      margin: [0, 20, 0, 0]
    });

    console.log(`[pdfmake] Images dictionary keys: ${Object.keys(images).join(', ')}`);
    console.log(`[pdfmake] Content items: ${content.length}`);

    const docDefinition = {
      content,
      images, // Pass images dictionary
      styles: {
        header: {
          fontSize: 24,
          bold: true
        },
        subheader: {
          fontSize: 18,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const outputPath = path.join(__dirname, '../output/pdfmake-test.pdf');
    const stream = (await import('fs')).createWriteStream(outputPath);

    pdfDoc.pipe(stream);
    pdfDoc.end();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const stats = await fs.stat(outputPath);
    const generationTime = Date.now() - startTime;

    return {
      success: true,
      library: 'pdfmake',
      generationTime,
      fileSize: stats.size,
      outputPath,
      notes: 'Native PNG/JPG support via base64 data URIs. SVG requires conversion to PNG first.'
    };
  } catch (error) {
    return {
      success: false,
      library: 'pdfmake',
      error: error.message,
      generationTime: Date.now() - startTime
    };
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  generatePDFWithPDFMake()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
