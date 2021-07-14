// Tabulates visible focusable and operable elements.
exports.reporter = async page => {
  const data = await require('../../procs/test/focOp').focOp(page, false, false);
  delete data.items;
  return {result: data};
};
