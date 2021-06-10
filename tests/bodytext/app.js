// Reports the text content of the document body.
exports.reporter = async page => {
  const bodyText = await page.textContent('body');
  return {
    result: {
      url: page.url(),
      textContent: bodyText
    }
  };
};
