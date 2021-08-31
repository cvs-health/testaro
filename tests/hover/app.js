// Tabulates elements that add to the page content when hovered over.
exports.reporter = async page => {
  const data = await require('../../procs/test/hover').hover(page, true);
  return {result: data};
};
