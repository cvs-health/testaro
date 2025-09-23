/*
  datalistRef
  Report inputs whose list attribute references a missing or ambiguous datalist
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const all = await init(100, page, 'input[list]');
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      const list = el.getAttribute('list');
      if (!list) return false;
      const matches = Array.from(document.querySelectorAll('datalist')).filter(d => d.id === list);
      return matches.length !== 1;
    });
    if (isBad) all.locs.push(loc);
  }
  const whats = [
    'list attribute of the element references an ambiguous or missing datalist element',
    'list attributes of elements reference ambiguous or missing datalist elements'
  ];
  return await report(withItems, all, 'datalistRef', whats, 3, 'INPUT');
};
