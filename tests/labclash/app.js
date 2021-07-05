// Lists labeling conflicts of input and select elements.
exports.reporter = async page => {
  const data = require('../../procs/test/labClash').labClash(page, true);
  return {result: data};
};
