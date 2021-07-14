// Tabulates and lists focusable and operable elements after making all elements visible.
exports.reporter = async page => {
  const report = await require('../../procs/test/focOp').focOp(page, true, true);
  return report;
};
