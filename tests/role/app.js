// Lists role attributes of elements.
exports.reporter = async page => await page.$eval('body', body => {
  const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
  const result = elements.map((element, index) => ({
    index,
    element: element.tagName.toLowerCase(),
    role: element.getAttribute('role')
  }));
  return {
    result
  };
});
