// Creates a report for testing.
exports.reporter = async page => {
  const focusButton = await page.$('#techButton');
  await page.evaluate(() => {
    document.getElementById('persButton').tabIndex = -1;
    document.getElementById('techButton').tabIndex = 0;
  });
  await focusButton.focus();
  await page.keyboard.press('ArrowRight');
  const newFocusText = await page.evaluate(() => document.activeElement.textContent.trim());
  return {result: {newFocusText}};
};
