/*
  title
  This test reports the page title.
*/
exports.reporter = async page => {
  const title = await page.title();
  return {result: {
    success: true,
    title
  }};
};
