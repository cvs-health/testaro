// Tabulates focusable and operable elements after making all elements visible.
exports.reporter = async page => {
  const data = await require('../../procs/test/focOp').focOp(page, false, true);
  delete data.result.items;
  return {result: data};
};
