# Asset Loading Variants

This project now supports two approaches for loading assets (images, SVGs) in HTML to PDF conversion:

## Variants Available

### 1. Base64 Variants
- `puppeteer-base64` - Puppeteer with base64 data URIs
- `playwright-base64` - Playwright with base64 data URIs

### 2. BaseURL Variants
- `puppeteer-baseurl` - Puppeteer with file paths using baseURL
- `playwright-baseurl` - Playwright with file paths using baseURL

## Base64 Approach

**How it works:**
- Assets are read from files
- Converted to base64 data URIs
- Embedded directly in HTML as `data:image/svg+xml;base64,...`

**HTML Template:** `assets/sample-html.html`
```html
<img src="{{testSvgDataUri}}" />
<img src="{{testImageDataUri}}" />
```

**Pros:**
- ✅ Works with `setContent()` (no base URL needed)
- ✅ Self-contained HTML
- ✅ No file path dependencies

**Cons:**
- ❌ ~33% larger HTML size
- ❌ Encoding/decoding overhead
- ❌ Harder to debug

## BaseURL Approach

**How it works:**
- Assets remain as files
- HTML uses relative paths: `<img src="test.svg" />`
- `setContent()` is called with `baseURL` pointing to assets directory

**HTML Template:** `assets/sample-html-baseurl.html`
```html
<img src="test.svg" />
<img src="test-image.png" />
```

**Pros:**
- ✅ Smaller HTML size
- ✅ Better performance
- ✅ Cleaner HTML
- ✅ Easier to debug
- ✅ No encoding overhead

**Cons:**
- ⚠️ Assets must be in same directory as HTML template
- ⚠️ Requires proper baseURL setup

## Developer Requirements

### For BaseURL Approach:

**Important:** When creating a new HTML template, assets (images, SVGs) **must** be placed in the **exact same directory** as the HTML file.

**Example:**
```
assets/
  ├── template1.html
  ├── template1-logo.svg      ← Same directory
  ├── template1-image.png     ← Same directory
  ├── template2.html
  ├── template2-logo.svg      ← Same directory
  └── template2-image.png     ← Same directory
```

**In HTML:**
```html
<!-- Use relative paths -->
<img src="template1-logo.svg" />
<img src="template1-image.png" />
```

**Code:**
```javascript
const htmlPath = path.join(__dirname, '../assets/template1.html');
const assetsDir = path.dirname(htmlPath);  // Same as HTML directory
const baseURL = `file://${assetsDir}/`;

await page.setContent(html, { 
  waitUntil: 'networkidle',
  baseURL: baseURL
});
```

## Usage

### Via API

```bash
# Base64 approach
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "playwright-base64", "data": {...}}'

# BaseURL approach
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "playwright-baseurl", "data": {...}}'
```

### Via NPM Scripts

```bash
# Base64 variants
npm run test:puppeteer-base64
npm run test:playwright-base64

# BaseURL variants
npm run test:puppeteer-baseurl
npm run test:playwright-baseurl
```

## Docker Compatibility

Both approaches work in Docker. The `assets` directory is mounted as a volume:

```yaml
volumes:
  - ./assets:/app/assets
```

This ensures assets are accessible for both approaches.

## Recommendation

**For Production:** Use **baseURL approach** (`playwright-baseurl` or `puppeteer-baseurl`)
- Better performance
- Smaller file sizes
- Cleaner code

**For Quick Tests:** Use **base64 approach** (`playwright-base64` or `puppeteer-base64`)
- Simpler setup
- Self-contained

## File Structure

```
tests/
  ├── puppeteer-base64-test.js    # Base64 variant
  ├── puppeteer-baseurl-test.js   # BaseURL variant
  ├── playwright-base64-test.js   # Base64 variant
  └── playwright-baseurl-test.js  # BaseURL variant

assets/
  ├── sample-html.html            # For base64 approach
  ├── sample-html-baseurl.html    # For baseURL approach
  ├── test.svg                    # Asset (used by both)
  ├── logo.svg                    # Asset (used by both)
  └── test-image.png              # Asset (used by both)
```
