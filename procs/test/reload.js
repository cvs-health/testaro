// Tries to reload.
const tryReload = async (page, url, timeout, awaitIdle) => {
  const waitUntil = awaitIdle ? 'networkidle' : 'domcontentloaded';
  const response = await page.reload(url, {
    timeout,
    waitUntil
  })
  .catch(error => {
    console.log(`ERROR: Reload timed out before ${waitUntil} (${error.message})`);
    return null;
  });
  const httpStatus = response.status();
  if (httpStatus === 200) {
    const actualURL = page.url();
    if (actualURL !== url) {
      console.log(`ERROR: Reload redirected from ${url} to ${actualURL}`);
      return null;
    }
    else {
      return true;
    }
  }
  else {
    console.log(`ERROR: Reload got status ${httpStatus}`);
    return null;
  }
};
// Reloads a page.
exports.reload = async page => {
  // Identify the URL.
  const url = page.url();
  // Reload and wait 15 seconds or until the network is idle.
  let success = await tryReload(page, url, 15000, true);
  // If the reload fails:
  if (! success) {
    // Try again, but waiting until the DOM is loaded.
    success = await tryReload(page, url, 15000, false);
    // If the reload fails:
    if (! success) {
      // Give up.
      console.log(`ERROR: Reload of ${url} failed`);
      await page.goto('about:blank');
    }
  }
  // If either reload succeeded:
  if (success) {
    // Press the Esc key to dismiss any initial modal dialog.
    await page.keyboard.press('Escape');
  }
};
