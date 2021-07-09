// Tabulates style inconsistencies.
exports.reporter = async page => {
  const data = await require('../../procs/test/styleDiff').styleDiff(page, false);
  return {result: data};
};
