/*
  captionLoc
  Report caption elements that are not the first child of their table element.
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const all = await init(100, page, 'caption');
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      const parent = el.parentElement;
      if (!parent || parent.tagName !== 'TABLE') return false;
      return parent.firstElementChild !== el;
    });
    if (isBad) all.locs.push(loc);
  }
  const whats = [
    'Element is not the first child of a table element',
    'caption elements are not the first children of table elements'
  ];
  return await report(withItems, all, 'captionLoc', whats, 3, 'CAPTION');
};
