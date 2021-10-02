// Returns the text associated with an element.
exports.reload = async page => {
  // Reload the page to undo content changes.
  await page.reload({timeout: 10000}).catch(error => {
    console.log(error.message, error.stack.slice(0, 1000));
  });
  // Press the Esc key to dismiss any initial modal dialog.
  await page.keyboard.press('Escape');
};
