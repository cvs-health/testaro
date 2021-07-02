// Tabulates focusable and visible operable elements.
exports.reporter = async page => {
  const report = await require('../../procs/test/focOp').focOp(page, false, true);
  delete report.result.items;
  return report;
};
