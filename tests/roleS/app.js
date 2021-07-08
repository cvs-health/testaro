// Tabulates elements with inaccessible roles.
exports.reporter = async page => {
  const data = await require('../../procs/test/role').role(page);
  return {result: data};
};
