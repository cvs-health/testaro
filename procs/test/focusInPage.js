// Returns whether an element in the page is in focus.
exports.focusInPage = page => page.evaluate(() => {
  // Identify the focused element, if any.
  const focalEl = document.activeElement;
  // Return whether there is one inside the body.
  return focalEl && focalEl !== document.body;
});
