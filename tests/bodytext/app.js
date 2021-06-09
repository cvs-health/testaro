// Creates a perfunctory useless report for testing.
exports.reporter = async page => {
  const bodyText = await page.textContent('body');
  return {
    result: {
      url: page.url(),
      textContent: bodyText
    }
  };
};
