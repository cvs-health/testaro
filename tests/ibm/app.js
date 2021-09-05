// Conducts and reports a detailed IBM test.
exports.reporter = async (page, source) => {
  const data = await require('../../procs/test/ibm').ibm(page, true, source);
  return {result: data};
};
