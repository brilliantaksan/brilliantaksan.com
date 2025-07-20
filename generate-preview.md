# Generate Social Media Preview Image

## Option 1: Using Browser (Recommended)

1. Open `preview.html` in your browser
2. Take a screenshot at 1200x630 pixels
3. Save as `preview.png` in your website root directory

## Option 2: Using Command Line (if you have Chrome)

```bash
# Install Chrome headless if you don't have it
# Then run:
google-chrome --headless --screenshot=preview.png --window-size=1200,630 preview.html
```

## Option 3: Online Tools

1. Go to https://www.browserstack.com/screenshot
2. Upload `preview.html`
3. Set viewport to 1200x630
4. Download the screenshot

## Option 4: Using Puppeteer (Node.js)

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto('file://' + __dirname + '/preview.html');
  await page.screenshot({ path: 'preview.png' });
  await browser.close();
})();
```

## What the Preview Shows

- Your sun cursor logo in the top-left
- "You deserve to feel HEARD" as the main title
- "Book a free listening session - No judgment. Just presence." as subtitle
- Your website URL (brilliantaksan.com)
- Matches your website's white and yellow theme
- Includes animated leaves for visual appeal

## After Generating

1. Upload `preview.png` to your website root
2. The meta tags in `index.html` will automatically use it
3. Test the preview using:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/ 