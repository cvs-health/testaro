// Conducts and reports a summary IBM test.
exports.reporter = async (page, source) => {
  const data = await require('../../procs/test/ibm').ibm(page, false, source);
  return {result: data};
};
