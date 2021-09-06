// Lists role attributes of elements.
exports.reporter = async (page, withItems) => await page.$eval('body', (body, withItems) => {
  const elements = Array.from(body.querySelectorAll('[role]:not([role=""])'));
  let data;
  if (withItems) {
    // Get the elements that have role attributes.
    data = {};
    // Compile a tabulation of their types and roles.
    elements.forEach(element => {
      const type = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      if (data[type]) {
        if (data[type][role]) {
          data[type][role]++;
        }
        else {
          data[type][role] = 1;
        }
      }
      else {
        data[type] = {[role]: 1};
      }
    });
  }
  else {
    data = elements.map((element, index) => ({
      index,
      element: element.tagName.toLowerCase(),
      role: element.getAttribute('role')
    }));
    return {result: data};
  }
  // Return the result.
  return {result: data};
}, withItems);
