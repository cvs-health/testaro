// Tabulates and lists focusable elements with and without outlines when focused.
exports.reporter = async page => {
  const report = await require('../../procs/test/focusOutline').focusOutline(page, true);
  return report;
};
