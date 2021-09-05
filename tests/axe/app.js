// Conducts and reports a detailed Axe test with specified rules.
exports.reporter = async (page, rules) => {
  const data = await require('../../procs/test/axe').axe(page, true, rules);
  return {result: data};
};
