// Tabulates and lists radio buttons in and not in accessible fieldsets.
exports.reporter = async page => {
  const data = await require('../../procs/test/radioSet').radioSet(page, true);
  return {result: data};
};
