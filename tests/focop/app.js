// Tabulates and lists focusable and all operable elements.
exports.reporter = async page => {
  const report = await require('../../procs/test/focOp').focOp(page, true, false);
  return report;
};
