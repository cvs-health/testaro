// Tabulates and lists focusable and operable elements.
exports.reporter = async page => {
  const report = await require('../../procs/test/focOp').focOp(page, true);
  return report;
};
