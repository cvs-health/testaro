// Tabulates and lists focusable and visible operable elements.
exports.reporter = async page => {
  const report = await require('../../procs/test/focOp').focOp(page, true, true);
  return report;
};
