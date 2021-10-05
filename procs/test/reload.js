// Tries to reload.
const tryReload = async (page, url, timeout, awaitIdle) => {
  const waitUntil = awaitIdle ? 'networkidle' : 'domcontentloaded';
  // Reload.
  const response = await page.reload(url, {
    timeout,
    waitUntil
  })
  // If the reload times out:
  .catch(error => {
    console.log(`ERROR: Reload timed out before ${waitUntil} (${error.message})`);
    // Return a failure.
    return null;
  });
  // If the reload succeeded:
  if (response) {
    const httpStatus = response.status();
    // If the HTTP status was success or cache-is-current:
    if ([200, 304].includes(httpStatus)) {
      // Identify the URL.
      const actualURL = page.url();
      // If it has changed:
      if (actualURL !== url) {
        console.log(`ERROR: Reload redirected from ${url} to ${actualURL}`);
        // Return a failure.
        return null;
      }
      // Otherwise, i.e. if the URL has not changed:
      else {
        // Return a success.
        return true;
      }
    }
    // Otherwise, i.e. if the HTTP status was wrong:
    else {
      console.log(`ERROR: Reload got status ${httpStatus}`);
      // Return a failure.
      return null;
    }
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
