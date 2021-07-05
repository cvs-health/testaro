// Lists labeling conflicts of input and select elements.
exports.reporter = async page => {
  const data = await require('../../procs/test/labClash').labClash(page, false);
  return {result: data};
};
