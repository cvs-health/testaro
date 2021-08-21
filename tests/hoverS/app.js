// Tabulates elements with inaccessible roles.
exports.reporter = async page => {
  const data = await require('../../procs/test/hover').role(page, false);
  return {result: data};
};
