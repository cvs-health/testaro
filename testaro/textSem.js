/*
  textSem
  Report semantically vague inline elements: i, b, small
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const all = await init(100, page, 'i, b, small');
  for (const loc of all.allLocs) {
    // Consider only elements with visible text
    const isBad = await loc.evaluate(el => {
      const text = (el.textContent || '').trim();
      return !!text;
    });
    if (isBad) all.locs.push(loc);
  }
  const whats = [
    'Element is semantically vague',
    'Semantically vague elements i, b, and/or small are used'
  ];
  return await report(withItems, all, 'textSem', whats, 0);
};
