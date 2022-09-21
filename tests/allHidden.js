/*
  allHidden
  This test reports a page that is entirely or mainly hidden.
*/
exports.reporter = async page => {
  const data = await page.evaluate(() => ({
    document: document.documentElement.hidden,
    body: document.body && document.body.hidden,
    main: document.body && document.body.main && document.body.main.hidden
  }));
  return {result: data};
};
