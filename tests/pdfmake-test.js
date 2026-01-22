import PdfPrinter from 'pdfmake';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * pdfmake PDF Generation Test
 *
 * Pros:
 * - Declarative API (JSON-like structure)
 * - Good for structured documents
 * - Supports images and basic graphics
 * - Pure JavaScript (good ARM compatibility)
 *
 * Cons:
 * - Limited HTML/CSS support
 * - SVG support is limited
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

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
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
        { text: '[SVG support is limited in pdfmake]', italics: true, color: 'gray', margin: [0, 20, 0, 0] }
      ],
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
      notes: 'Declarative API, limited SVG support'
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
