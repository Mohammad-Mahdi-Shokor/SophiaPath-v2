const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Assuming the dev server is running on 5173
  await page.goto('http://localhost:5173/cyber-lab', { waitUntil: 'networkidle0' });
  
  // Click the Caesar Cipher tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.cyber-lab-tab-btn'));
    const caesarTab = tabs.find(t => t.textContent.includes('Caesar Cipher'));
    if (caesarTab) caesarTab.click();
  });
  
  // Wait a moment for the transition
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await page.screenshot({ path: '/home/mohammad-mahdi/.gemini/antigravity/artifacts/caesar_error.png' });
  
  await browser.close();
})();
