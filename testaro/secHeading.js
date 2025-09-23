/*
  secHeading
  Flag headings that are a lower-numbered heading (e.g., H2 after H3) than the
  immediately preceding heading within the same sectioning container.
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  const all = await init(200, page, 'h1,h2,h3,h4,h5,h6');
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      // find nearest sectioning ancestor
      let ancestor = el.parentElement;
      while (ancestor && !['SECTION','ARTICLE','NAV','ASIDE','MAIN','BODY','HTML'].includes(ancestor.tagName)) {
        ancestor = ancestor.parentElement;
      }
      if (!ancestor) return false;
      const headings = Array.from(ancestor.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      const idx = headings.indexOf(el);
      if (idx <= 0) return false;
      const prev = headings[idx - 1];
      const curLevel = Number(el.tagName.substring(1));
      const prevLevel = Number(prev.tagName.substring(1));
      return curLevel < prevLevel;
    });
    if (isBad) all.locs.push(loc);
  }
  const whats = [
    'Element violates the logical level order in its sectioning container',
    'Heading elements violate the logical level order in their sectioning containers'
  ];
  return await report(withItems, all, 'secHeading', whats, 1);
};
