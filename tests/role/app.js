// Compiles a report.
exports.reporter = async page => await page.$eval('body', body => {
  const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
  return elements.map((element, index) => ({
    index,
    element: element.tagName.toLowerCase(),
    role: element.getAttribute('role') || 'NONE'
  }));
});
