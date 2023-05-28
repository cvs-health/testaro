/*
  title
  This test reports the page title.
*/
exports.reporter = async page => {
  const title = await page.title();
  return {
    data: {
      success: true,
      title
    },
    totals: [],
    standardInstances: []
  };
};
