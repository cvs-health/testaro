// Tabulates and lists visible focusable and operable elements.
exports.reporter = async page => {
  const data = await require('../../procs/test/focOp').focOp(page, true, false);
  return {result: data};
};
