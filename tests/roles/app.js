// Lists counts of combinations of element tag names and role attributes.
exports.reporter = async page => {
  return await page.$eval('body', body => {
    // Get the elements that have role attributes.
    const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
    const result = {};
    // Compile a tabulation of their types and roles.
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
    // Return an object with the tabulation as its result.
    return {
      result
    };
  });
};
