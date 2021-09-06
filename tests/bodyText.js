// Reports the text content of the document body.
exports.reporter = async page => {
  const bodyText = await page.textContent('body');
  const textContent = bodyText.replace(/\s+/g, ' ');
  return {
    result: {
      url: page.url(),
      textContent
    }
  };
};
