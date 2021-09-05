// Conducts and reports a summary Axe test with all rules.
exports.reporter = async page => {
  const data = await require('../../procs/test/axe').axe(page, false, []);
  return {result: data};
};
