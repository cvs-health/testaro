const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const target = `file://${path.resolve(__dirname, '../validation/tests/targets/altScheme/index.html')}`;
  console.log('Opening', target);
  await page.goto(target, { waitUntil: 'domcontentloaded' });
  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    id: img.id || null,
    alt: img.getAttribute('alt'),
    src: img.getAttribute('src'),
    href: img.getAttribute('href')
  })));
  console.log(JSON.stringify(images, null, 2));
  await browser.close();
})();
