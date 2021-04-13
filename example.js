const {chromium, firefox, webkit} = require('playwright');
(async () => {
  [chromium, firefox, webkit].forEach(async agent => {
    const ui = await agent.launch();
    const page = await ui.newPage();
    await page.goto('https://jpdev.pro/jpdev/blog/entries/0002/index.html');
    const image = await page.$('[src=404.png]');
    await image.screenshot({path: `image-${agent}.png`});
    await ui.close();
  });
})();
