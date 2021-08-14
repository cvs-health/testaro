// Reports counts and fractions of underlined links among inline links.
exports.reporter = async page => {
  const result = await require('../../procs/test/linkUl').linkUl(page, true);
  return {result};
};
