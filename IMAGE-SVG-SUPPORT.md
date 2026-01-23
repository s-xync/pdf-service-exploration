# Image & SVG Support Comparison

Comprehensive comparison of image and SVG support across all PDF generation libraries.

## Quick Reference

| Library | PNG Support | JPG Support | SVG Support | Notes |
|---------|-------------|-------------|-------------|-------|
| **Puppeteer** | ✅ Native | ✅ Native | ✅ Native | Full browser rendering |
| **Playwright** | ✅ Native | ✅ Native | ✅ Native | Full browser rendering |
| **html-pdf-node** | ✅ Native | ✅ Native | ✅ Native | Uses Puppeteer internally |
| **PDFKit** | ✅ Native | ✅ Native | ✅ Via svg-to-pdfkit | Requires `svg-to-pdfkit` library |
| **pdfmake** | ✅ Native | ✅ Native | ❌ No | Requires SVG→PNG conversion |
| **pdf-lib** | ✅ Native | ✅ Native | ❌ No | Requires SVG→PNG conversion |

---

## Detailed Comparison

### 1. Puppeteer & Playwright

**Image Support:**
- ✅ **PNG**: Full support via HTML `<img>` tags or CSS backgrounds
- ✅ **JPG/JPEG**: Full support via HTML `<img>` tags or CSS backgrounds
- ✅ **WebP**: Supported (browser-dependent)
- ✅ **GIF**: Supported (browser-dependent)
- ✅ **Base64**: Full support via data URIs
- ✅ **File paths**: Supported with proper baseURL

**SVG Support:**
- ✅ **Full SVG rendering**: All SVG features supported
- ✅ **Inline SVG**: `<svg>` tags in HTML
- ✅ **SVG files**: Via `<img src="file.svg">` or CSS
- ✅ **SVG in CSS**: Background images, etc.
- ✅ **SVG animations**: Supported (though may not animate in PDF)
- ✅ **SVG filters**: Supported
- ✅ **SVG gradients**: Supported

**Implementation:**
```javascript
// Images work automatically in HTML
<img src="data:image/png;base64,..." />
<img src="image.png" />  // With baseURL

// SVG works automatically
<img src="logo.svg" />
<svg>...</svg>  // Inline SVG
```

**Pros:**
- Best image/SVG support (full browser capabilities)
- No additional libraries needed
- Handles all formats browsers support

**Cons:**
- Requires browser binary (larger Docker image)
- More resource-intensive

---

### 2. html-pdf-node

**Image Support:**
- ✅ **PNG**: Full support (uses Puppeteer internally)
- ✅ **JPG/JPEG**: Full support
- ✅ **Base64**: Full support via data URIs

**SVG Support:**
- ✅ **Full SVG rendering**: Uses Puppeteer's capabilities
- ✅ **SVG files**: Via `<img>` tags
- ✅ **Inline SVG**: Supported

**Implementation:**
Same as Puppeteer - it's a wrapper around Puppeteer.

**Pros:**
- Same capabilities as Puppeteer
- Simpler API

**Cons:**
- Uses older Puppeteer version (10.4.0)
- Less control than direct Puppeteer usage

---

### 3. PDFKit

**Image Support:**
- ✅ **PNG**: Native support via `doc.image()`
- ✅ **JPG/JPEG**: Native support via `doc.image()`
- ✅ **File paths**: Direct file path support
- ✅ **Buffers**: Image data as Buffer
- ❌ **WebP/GIF**: Not natively supported (would need conversion)

**SVG Support:**
- ✅ **Via svg-to-pdfkit**: Full SVG support with library
- ✅ **Most SVG features**: Paths, shapes, text, gradients, patterns
- ⚠️ **Some limitations**: Filters, certain text attributes not supported

**Implementation:**
```javascript
// Images
doc.image('path/to/image.png', {
  fit: [150, 150],
  align: 'center'
});

// SVG (requires svg-to-pdfkit)
import SVGtoPDF from 'svg-to-pdfkit';
const svgContent = await fs.readFile('logo.svg', 'utf-8');
SVGtoPDF(doc, svgContent, x, y, { width: 150, height: 150 });
```

**Installation:**
```bash
npm install svg-to-pdfkit
```

**Pros:**
- Native PNG/JPG support
- Good SVG support with library
- Pure JavaScript (no browser needed)
- Fast and lightweight

**Cons:**
- SVG requires additional library
- Some SVG features not supported
- Manual layout required

**SVG Features Supported by svg-to-pdfkit:**
- ✅ Shapes: rect, circle, path, ellipse, line, polyline, polygon
- ✅ Text: text, tspan, textPath
- ✅ Styling: fill, stroke, opacity, colors
- ✅ Transformations: translate, rotate, scale, skew
- ✅ Gradients: linear, radial
- ✅ Patterns
- ✅ Clip paths and masks
- ✅ Images embedded in SVG
- ❌ Filters (not supported)
- ❌ Some advanced text attributes

---

### 4. pdfmake

**Image Support:**
- ✅ **PNG**: Native support via base64 data URIs
- ✅ **JPG/JPEG**: Native support via base64 data URIs
- ✅ **File paths**: Supported in Node.js environment
- ✅ **Image dictionary**: Reuse images efficiently

**SVG Support:**
- ❌ **No native SVG support**
- ⚠️ **Workaround**: Convert SVG to PNG first, then embed

**Implementation:**
```javascript
// Images via base64
const images = {
  myImage: 'data:image/png;base64,iVBORw0KGgo...'
};

const docDefinition = {
  content: [
    { image: 'myImage', width: 150 }
  ],
  images
};

// SVG workaround: Convert to PNG first
// Use a library like sharp or canvas to convert SVG→PNG
```

**Pros:**
- Native PNG/JPG support
- Simple API
- Efficient image reuse

**Cons:**
- No SVG support
- SVG requires conversion to PNG (extra step)
- Conversion may lose some SVG features

**SVG Conversion Options:**
- `sharp` - Fast SVG to PNG conversion
- `canvas` - SVG rendering to PNG
- `puppeteer` - Render SVG to PNG (overkill)

---

### 5. pdf-lib

**Image Support:**
- ✅ **PNG**: Native support via `embedPng()`
- ✅ **JPG/JPEG**: Native support via `embedJpg()`
- ✅ **Image manipulation**: Scale, fit, etc.
- ❌ **Other formats**: Not natively supported

**SVG Support:**
- ❌ **No native SVG support**
- ⚠️ **Workaround**: Convert SVG to PNG first, then embed

**Implementation:**
```javascript
// PNG
const pngImageBytes = await fs.readFile('image.png');
const pngImage = await pdfDoc.embedPng(pngImageBytes);
page.drawImage(pngImage, {
  x: 50,
  y: 50,
  width: 150,
  height: 150
});

// JPG
const jpgImageBytes = await fs.readFile('image.jpg');
const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
page.drawImage(jpgImage, {
  x: 50,
  y: 50,
  width: 150,
  height: 150
});

// SVG workaround: Convert to PNG first
```

**Pros:**
- Native PNG/JPG support
- Good image manipulation API
- Modern, well-maintained

**Cons:**
- No SVG support
- SVG requires conversion to PNG
- Low-level API (more code)

---

## SVG Conversion Strategies

For libraries without native SVG support (pdfmake, pdf-lib):

### Option 1: Using sharp (Recommended)
```javascript
import sharp from 'sharp';

async function convertSvgToPng(svgPath, outputPath) {
  await sharp(svgPath)
    .png()
    .toFile(outputPath);
}

// Then use the PNG in your PDF
```

### Option 2: Using canvas
```javascript
import { createCanvas, loadImage } from 'canvas';

async function convertSvgToPng(svgPath) {
  const img = await loadImage(svgPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toBuffer('image/png');
}
```

### Option 3: Using Puppeteer (Overkill but reliable)
```javascript
import puppeteer from 'puppeteer';

async function convertSvgToPng(svgPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${svgPath}`);
  const png = await page.screenshot({ type: 'png' });
  await browser.close();
  return png;
}
```

---

## Recommendations

### For Full Image & SVG Support
**Use: Puppeteer, Playwright, or html-pdf-node**
- Best support for all formats
- No conversion needed
- Full browser capabilities

### For PNG/JPG Only (No SVG)
**Use: pdfmake or pdf-lib**
- Simple, lightweight
- Good performance
- Pure JavaScript

### For PNG/JPG + SVG Support (Pure JS)
**Use: PDFKit + svg-to-pdfkit**
- Pure JavaScript (no browser)
- Good SVG support
- Fast and lightweight
- Requires additional library

### For Complex SVG Requirements
**Use: Browser-based libraries (Puppeteer/Playwright)**
- Full SVG feature support
- No limitations
- Best rendering quality

---

## Code Examples

### PDFKit with Images and SVG
```javascript
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

const doc = new PDFDocument();

// PNG Image
doc.image('image.png', { fit: [150, 150] });

// JPG Image
doc.image('image.jpg', { fit: [150, 150] });

// SVG
const svgContent = await fs.readFile('logo.svg', 'utf-8');
SVGtoPDF(doc, svgContent, 50, 50, { width: 150, height: 150 });
```

### pdfmake with Images
```javascript
const images = {
  myImage: 'data:image/png;base64,...'
};

const docDefinition = {
  content: [
    { image: 'myImage', width: 150 }
  ],
  images
};
```

### pdf-lib with Images
```javascript
const pngImage = await pdfDoc.embedPng(pngBytes);
page.drawImage(pngImage, { x: 50, y: 50, width: 150, height: 150 });

const jpgImage = await pdfDoc.embedJpg(jpgBytes);
page.drawImage(jpgImage, { x: 50, y: 200, width: 150, height: 150 });
```

---

## Testing

All enhanced test files now include:
- ✅ PNG image rendering
- ✅ JPG image rendering
- ✅ SVG rendering (where supported)

Run tests to see actual output:
```bash
npm run test:api
```

Check the generated PDFs in `./output/` directory to verify image and SVG rendering.

---

## Summary

| Aspect | Browser-based | PDFKit | pdfmake | pdf-lib |
|--------|---------------|--------|---------|---------|
| **PNG** | ✅✅✅ | ✅✅ | ✅✅ | ✅✅ |
| **JPG** | ✅✅✅ | ✅✅ | ✅✅ | ✅✅ |
| **SVG** | ✅✅✅ | ✅✅ (with lib) | ❌ | ❌ |
| **Setup** | Complex | Simple | Simple | Simple |
| **Performance** | Slower | Fast | Fast | Fast |
| **Docker Size** | Large | Small | Small | Small |

**Legend:**
- ✅✅✅ = Excellent support
- ✅✅ = Good support (may need library)
- ❌ = Not supported
