// Compiles a report.
exports.reporter = async page => {
  return await page.$eval('body', body => {
    const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
    const result = {};
    elements.forEach(element => {
      const type = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      if (result[type]) {
        if (result[type][role]) {
          result[type][role]++;
        }
        else {
          result[type][role] = 1;
        }
      }
      else {
        result[type] = {[role]: 1};
      }
    });
    return {
      result
    };
  });
};
