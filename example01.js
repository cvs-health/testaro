const {chromium, firefox, webkit} = require('playwright');
(async () => {
  [chromium, firefox, webkit].forEach(async agent => {
    const ui = await agent.launch();
    const page = await ui.newPage();
    await page.goto('https://design.aetna.com');
    const link = await page.$(':nth-match(a, 7)');
    const linkBox = await link.boundingBox();
    const shotBox = {
      x: linkBox.x - 10,
      y: linkBox.y - 10,
      width: linkBox.width + 20,
      height: linkBox.height + 20
    };
    await page.screenshot({
      clip: shotBox,
      path: `link-blur-${agent.name()}.png`
    });
    await link.focus();
    await page.screenshot({
      clip: shotBox,
      path: `link-focus-${agent.name()}.png`
    });
    await ui.close();
  });
})();
