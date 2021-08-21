// Tabulates elements with inaccessible roles.
exports.reporter = async page => {
  const data = await require('../../procs/test/hover').hover(page, true);
  return {result: data};
};
