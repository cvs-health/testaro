// Tabulates and lists style inconsistencies.
exports.reporter = async page => {
  const data = await require('../../procs/test/styleDiff').styleDiff(page, true);
  return {result: data};
};
