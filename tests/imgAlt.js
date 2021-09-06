// Lists the values of the alt attributes of img elements.
exports.reporter = async page => await page.$eval('body', body => {
  // Get an array of img elements with non-empty alt attributes.
  const elements = Array.from(body.querySelectorAll('img[alt]:not([alt=""])'));
  // Return a result containing an array of the alt values.
  return {
    result: {
      textAlternatives: elements.map(el => el.alt).sort()
    }
  };
});
