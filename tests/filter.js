/*
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content 
*/
exports.reporter = async (page, withItems) => {
  // Identify the initially visible links.
  const badLinks = await page.$$eval('a:visible', links => {
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    const badLinks = [];
    links.forEach(link => {
      link.focus();
      if (link.offsetTop + link.offsetHeight <= 0 || link.offsetLeft + link.offsetWidth <= 0) {
        badLinks.push(compact(link.textContent));
      }
    });
    return badLinks;
  });
  const data = {
    total: badLinks.length
  };
  if (withItems) {
    data.items = badLinks;
  }
  return {result: data};
};
