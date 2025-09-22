/*
  adbID
  Clean-room rule: report elements that reference aria-describedby targets that are missing or ambiguous (duplicate ids).
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  // elements that reference aria-describedby
  const all = await init(200, page, '[aria-describedby]');
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      const raw = el.getAttribute('aria-describedby') || '';
      const ids = raw.trim().split(/\s+/).filter(Boolean);
      if (ids.length === 0) return false;
      // for each referenced id, check how many elements have that id
      for (const id of ids) {
        try {
          // exact match (case-sensitive)
          const exact = document.querySelectorAll('#' + CSS.escape(id));
          if (exact.length === 1) continue;
          // if not exactly one, try case-insensitive match by normalizing
          const allIds = Array.from(document.querySelectorAll('[id]')).map(e => e.getAttribute('id'));
          const ci = allIds.filter(i => i && i.toLowerCase() === id.toLowerCase()).length;
          if (ci === 1) continue;
          // otherwise it's missing or ambiguous
          return true;
        } catch (e) {
          return true;
        }
      }
      return false;
    });
    if (isBad) all.locs.push(loc);
  }

  const whats = [
    'Referenced description of the element is ambiguous or missing',
    'Referenced descriptions of elements are ambiguous or missing'
  ];
  return await report(withItems, all, 'adbID', whats, 3);
};
