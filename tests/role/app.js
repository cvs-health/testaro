// Compiles a report.
exports.reporter = async page => {
  // Get an array of data on all elements with role attributes.
  const data = await page.$eval('body', body => {
    const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
    return elements.map((element, index) => {
      const liParts = {
        index: `${index}.`,
        type: `Element: <code>${element.tagName.toLowerCase()}</code>.`,
        role: `Role: <code>${element.getAttribute('role')}</code>.`
      };
      return `<li>${liParts.join(' ')}</li>`;
    });
  });
  return {
    json: false,
    data
  };
};
