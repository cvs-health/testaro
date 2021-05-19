// Compiles a report.
exports.reporter = async page => {
  return await page.$eval('body', body => {
    const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
    const tally = {};
    elements.forEach(element => {
      const type = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      if (tally[type]) {
        if (tally[type][role]) {
          tally[type][role]++;
        }
        else {
          tally[type][role] = 1;
        }
      }
      else {
        tally[type] = {[role]: 1};
      }
    });
    return Object.keys(tally).length ? tally : 'NONE';
  });
};
