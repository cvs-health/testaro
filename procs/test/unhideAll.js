// Unhides all of the page content.
exports.unhideAll = async page => {
  await page.$eval('body', body => {
    // Identify all elements in the body.
    const elements = Array.from(body.querySelectorAll('*'));
    // For each of them:
    elements.forEach(element => {
      // Identify its style declaration.
      const styleDec = window.getComputedStyle(element);
      // Ensure that the element is visible.
      if (styleDec.visibility === 'hidden') {
        element.style.visibility = 'visible';
      }
      // Ensure that the element is displayed.
      if (styleDec.display === 'none') {
        element.style.display = 'unset';
      }
    });
  });
  return 1;
};
