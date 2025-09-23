/*
  altScheme
  Identify img elements whose alt attribute is an entire URL or clearly a file name (favicon).
*/

const {init, report} = require('../procs/testaro');

exports.reporter = async (page, withItems) => {
  // Candidate images: any img with an alt attribute (including empty)
  const all = await init(100, page, 'img[alt]');
  for (const loc of all.allLocs) {
    const isBad = await loc.evaluate(el => {
      const alt = (el.getAttribute('alt') || '').trim();
      if (!alt) return false;
  // full-string URL (http(s) or file or ftp) — must be the entire alt value
  if (/^\s*(?:https?:|file:|ftp:)\S+\s*$/i.test(alt)) return true;
      // favicon or typical file names
      if (/favicon/i.test(alt)) return true;
  // common image file extensions that occupy the entire alt or are the base filename
  if (/^\s*\S+\.(?:png|jpe?g|gif|svg|webp|ico)\s*$/i.test(alt)) return true;
      // match exact equality with src or href attributes
      const href = (el.getAttribute('href') || el.getAttribute('src') || '').trim();
      if (href && alt === href) return true;
      return false;
    });
    if (isBad) all.locs.push(loc);
  }
  const whats = [
    'Element has an alt attribute with a URL as its entire value',
    'img elements have alt attributes with URLs as their entire values'
  ];
  return await report(withItems, all, 'altScheme', whats, 2);
};
