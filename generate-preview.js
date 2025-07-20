const puppeteer = require('puppeteer');
const path = require('path');

async function generatePreview() {
    console.log('🌞 Generating social media preview image...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport to social media preview size
        await page.setViewport({ 
            width: 1200, 
            height: 630,
            deviceScaleFactor: 2 // Higher quality
        });
        
        // Load the preview HTML file
        const filePath = path.join(__dirname, 'preview.html');
        await page.goto(`file://${filePath}`, { 
            waitUntil: 'networkidle0' 
        });
        
        // Wait a bit for animations to settle
        await page.waitForTimeout(2000);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'preview.png',
            type: 'png',
            fullPage: false
        });
        
        console.log('✅ Preview image generated: preview.png');
        console.log('📱 Size: 1200x630px (perfect for social media)');
        console.log('🎨 Features: Sun logo, your brand colors, animated elements');
        
    } catch (error) {
        console.error('❌ Error generating preview:', error.message);
    } finally {
        await browser.close();
    }
}

// Check if puppeteer is available
try {
    require.resolve('puppeteer');
    generatePreview();
} catch (e) {
    console.log('📦 Puppeteer not installed. Installing...');
    console.log('Run: npm install puppeteer');
    console.log('Then run: node generate-preview.js');
    console.log('');
    console.log('Or use the manual method:');
    console.log('1. Open preview.html in your browser');
    console.log('2. Take a screenshot at 1200x630 pixels');
    console.log('3. Save as preview.png');
} 