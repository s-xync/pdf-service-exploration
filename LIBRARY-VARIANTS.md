# Library Variants Guide

This project supports multiple variants of Puppeteer and Playwright for PDF generation.

## Available Variants

### Old Variants (Original Implementations)
- `puppeteer` - Original Puppeteer implementation (uses base64)
- `playwright` - Original Playwright implementation (uses base64)

### New Variants
- `puppeteer-base64` - Puppeteer with explicit base64 approach
- `puppeteer-baseurl` - Puppeteer with file paths using baseURL
- `playwright-base64` - Playwright with explicit base64 approach
- `playwright-baseurl` - Playwright with file paths using baseURL

## Testing

### Via Test Script

Edit `test-all-libraries.sh` and uncomment the libraries you want to test:

```bash
# New variants only
LIBRARIES=("puppeteer-base64" "puppeteer-baseurl" "playwright-base64" "playwright-baseurl")

# Old variants only
# LIBRARIES=("puppeteer" "playwright")

# All variants
# LIBRARIES=("puppeteer" "playwright" "puppeteer-base64" "puppeteer-baseurl" "playwright-base64" "playwright-baseurl")
```

### Via NPM Scripts

```bash
# Old variants
npm run test:puppeteer
npm run test:playwright

# New variants
npm run test:puppeteer-base64
npm run test:puppeteer-baseurl
npm run test:playwright-base64
npm run test:playwright-baseurl
```

### Via API

```bash
# Old variants
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "puppeteer", "data": {...}}'

# New variants
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"library": "playwright-baseurl", "data": {...}}'
```

## Differences

### Old Variants
- Use `sample-html.html` template
- Convert assets to base64 data URIs
- Function names: `generatePDFWithPuppeteer()`, `generatePDFWithPlaywright()`
- Output files: `puppeteer-test.pdf`, `playwright-test.pdf`

### New Variants

**Base64 Variants:**
- Use `sample-html.html` template
- Convert assets to base64 data URIs (explicit approach)
- Function names: `generatePDFWithPuppeteerBase64()`, `generatePDFWithPlaywrightBase64()`
- Output files: `puppeteer-base64-test.pdf`, `playwright-base64-test.pdf`

**BaseURL Variants:**
- Use `sample-html-baseurl.html` template
- Use file paths with baseURL (no base64 encoding)
- Function names: `generatePDFWithPuppeteerBaseURL()`, `generatePDFWithPlaywrightBaseURL()`
- Output files: `puppeteer-baseurl-test.pdf`, `playwright-baseurl-test.pdf`

## File Structure

```
tests/
  ├── puppeteer-test.js           # Old variant (original)
  ├── playwright-test.js          # Old variant (original)
  ├── puppeteer-base64-test.js    # New variant (base64)
  ├── puppeteer-baseurl-test.js   # New variant (baseURL)
  ├── playwright-base64-test.js   # New variant (base64)
  └── playwright-baseurl-test.js  # New variant (baseURL)

assets/
  ├── sample-html.html            # For old and base64 variants
  └── sample-html-baseurl.html    # For baseURL variants
```

## Notes

- Old variants are kept intact and functional
- New variants provide explicit approaches (base64 vs baseURL)
- All variants are available in the API server
- You can test any combination by editing `test-all-libraries.sh`
