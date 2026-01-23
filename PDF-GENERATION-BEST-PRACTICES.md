# PDF Generation Best Practices & Common Issues

Comprehensive guide for backend PDF generation covering common problems, best practices, and testing strategies.

## Table of Contents

1. [CSS & Styling Issues](#css--styling-issues)
2. [Page Breaks & Pagination](#page-breaks--pagination)
3. [Borders & Layout](#borders--layout)
4. [Fonts & Typography](#fonts--typography)
5. [Images & Assets](#images--assets)
6. [Performance Optimization](#performance-optimization)
7. [Security Considerations](#security-considerations)
8. [Error Handling & Reliability](#error-handling--reliability)
9. [Testing Strategies](#testing-strategies)
10. [Browser-Specific Issues](#browser-specific-issues)

---

## CSS & Styling Issues

### ✅ Common Problems

#### 1. **CSS Not Applied / Missing Styles**
**Problem:** External CSS files not loading, styles not rendering
**Solutions:**
- ✅ **Inline CSS** - Embed all CSS in `<style>` tags in HTML
- ✅ **Use `printBackground: true`** in PDF options
- ✅ **Wait for styles to load** - Use `waitUntil: 'networkidle0'` or `waitUntil: 'load'`
- ✅ **CSS inlining tools** - Use libraries like `inline-css` (html-pdf-node does this)

```javascript
// Puppeteer/Playwright
await page.setContent(html, { 
  waitUntil: 'networkidle0'  // Wait for all resources
});

// PDF options
await page.pdf({
  printBackground: true,  // Critical for backgrounds, borders, etc.
  format: 'A4'
});
```

#### 2. **Media Queries Not Working**
**Problem:** Print-specific CSS not applying
**Solutions:**
- ✅ Use `@media print` queries
- ✅ Avoid `@media screen` dependencies
- ✅ Test with print preview

```css
@media print {
  .no-print { display: none; }
  .page-break { page-break-after: always; }
}
```

#### 3. **Flexbox/Grid Layout Issues**
**Problem:** Modern CSS layouts breaking in PDF
**Solutions:**
- ✅ Test thoroughly - some features may not render correctly
- ✅ Use fallback layouts for complex grids
- ✅ Consider using tables for structured layouts
- ✅ Avoid `position: fixed` (doesn't work well in PDFs)

---

## Page Breaks & Pagination

### ✅ Common Problems

#### 1. **Content Breaking Mid-Element**
**Problem:** Tables, images, or sections split across pages
**Solutions:**
- ✅ Use CSS page break properties:
  ```css
  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;  /* Modern syntax */
  }
  
  .page-break {
    page-break-after: always;
    break-after: page;  /* Modern syntax */
  }
  
  .keep-together {
    page-break-inside: avoid;
  }
  ```
- ✅ Group related content in containers with `page-break-inside: avoid`
- ✅ Use `orphans` and `widows` for text:
  ```css
  p {
    orphans: 3;  /* Min lines at bottom */
    widows: 3;    /* Min lines at top */
  }
  ```

#### 2. **Random Page Breaks**
**Problem:** Unexpected page breaks in content
**Solutions:**
- ✅ Set explicit page break rules
- ✅ Use `page-break-before: auto` to prevent unwanted breaks
- ✅ Test with different content lengths
- ✅ Use consistent margins/padding

---

## Borders & Layout

### ✅ Common Problems

#### 1. **Borders Not Rendering**
**Problem:** Borders missing or incomplete
**Solutions:**
- ✅ **Enable `printBackground: true`** (critical!)
- ✅ Use explicit border properties:
  ```css
  border: 1px solid #000;  /* Not just border: 1px */
  ```
- ✅ Avoid `border: none` then setting individual sides
- ✅ Use `box-sizing: border-box` for consistent sizing

#### 2. **Table Borders Breaking**
**Problem:** Table borders not continuous across cells
**Solutions:**
- ✅ Use `border-collapse: collapse` for tables
- ✅ Set borders on both `td` and `th` elements
- ✅ Avoid `border-spacing` with collapsed borders

---

## Fonts & Typography

### ✅ Common Problems

#### 1. **Fonts Not Loading**
**Problem:** Custom fonts not appearing, fallback fonts used
**Solutions:**
- ✅ **Embed fonts in HTML** using base64 data URIs
- ✅ Use web-safe fonts as fallback
- ✅ Include font files in Docker image if using file paths

#### 2. **Character Encoding Issues**
**Problem:** Special characters, emojis, or non-ASCII not rendering
**Solutions:**
- ✅ Set proper charset: `<meta charset="UTF-8">`
- ✅ Use HTML entities for special characters
- ✅ Test with various character sets

---

## Images & Assets

### ✅ Common Problems

#### 1. **Images Not Loading**
**Problem:** Images missing or broken in PDF
**Solutions:**
- ✅ **Use base64 data URIs** for reliability
- ✅ Or use absolute file paths with proper baseURL
- ✅ Wait for images to load: `waitUntil: 'networkidle0'`

#### 2. **Image Quality Issues**
**Problem:** Images appearing pixelated or low quality
**Solutions:**
- ✅ Use high-resolution source images
- ✅ Set appropriate `scale` in PDF options (1.0-2.0)
- ✅ Use vector formats (SVG) when possible

---

## Performance Optimization

### ✅ Best Practices

#### 1. **Browser Instance Management**
```javascript
// ❌ Bad: Create new browser for each PDF
// ✅ Good: Reuse browser instance
const browser = await puppeteer.launch();
for (const item of items) {
  const page = await browser.newPage();
  // ... generate PDF
  await page.close();
}
await browser.close();
```

#### 2. **Memory Management**
- ✅ Close pages after use
- ✅ Limit concurrent PDF generations
- ✅ Monitor memory usage
- ✅ Restart browser instances periodically

---

## Security Considerations

### ✅ Best Practices

#### 1. **Input Sanitization**
- ✅ Sanitize HTML input to prevent XSS
- ✅ Validate template variables
- ✅ Escape user-provided content

#### 2. **Resource Access**
- ✅ Restrict file system access
- ✅ Validate URLs if using `url` option
- ✅ Use allowlists for external resources
- ✅ Timeout for resource loading

---

## Error Handling & Reliability

### ✅ Best Practices

#### 1. **Timeout Handling**
```javascript
const timeout = 30000; // 30 seconds
const pdfBuffer = await Promise.race([
  page.pdf(options),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('PDF generation timeout')), timeout)
  )
]);
```

#### 2. **Resource Cleanup**
```javascript
let browser = null;
let page = null;
try {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  // ... generate PDF
} finally {
  if (page) await page.close();
  if (browser) await browser.close();
}
```

---

## Testing Strategies

### ✅ Test Cases to Cover

#### 1. **Content Variations**
- ✅ Short content (1 page)
- ✅ Long content (multiple pages)
- ✅ Empty/null values
- ✅ Special characters (unicode, emojis)

#### 2. **Layout Tests**
- ✅ Tables with many rows/columns
- ✅ Nested containers
- ✅ Different screen sizes

#### 3. **Asset Tests**
- ✅ Missing images (error handling)
- ✅ Large images (performance)
- ✅ Different image formats

---

## Quick Checklist

### Before Production Deployment

- [ ] All CSS is inlined or embedded
- [ ] `printBackground: true` is set
- [ ] Page break rules are defined
- [ ] Fonts are embedded or system fonts are used
- [ ] Images use base64 or verified file paths
- [ ] Error handling is comprehensive
- [ ] Timeouts are configured
- [ ] Memory usage is monitored
- [ ] Browser instances are properly managed
- [ ] Security measures are in place
- [ ] Tested with various content lengths
- [ ] Tested with special characters
- [ ] Tested with missing assets

---

## Summary

**Critical Settings:**
1. ✅ `printBackground: true` - Enables backgrounds, borders, shadows
2. ✅ `waitUntil: 'networkidle0'` - Ensures all resources loaded
3. ✅ Inline CSS - Prevents external CSS loading issues
4. ✅ Base64 assets - Reliable image/SVG loading
5. ✅ Page break CSS - Controls pagination
6. ✅ Error handling - Graceful failures
7. ✅ Timeouts - Prevents hanging
8. ✅ Resource cleanup - Prevents memory leaks

**Most Common Issues:**
1. Missing `printBackground: true`
2. External CSS not loading
3. Page breaks in wrong places
4. Images not loading
5. Fonts not rendering
6. Borders not showing
