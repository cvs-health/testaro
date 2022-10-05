/*
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content, overriding user settings,
  and requires the user to apply custom styles to neutralize it, which is difficult or impossible
  in some user environments.
*/
// Returns a space-minimized copy of a string.
const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Identify the elements with filter style properties.
  const filterElements = await page.$$eval('document.body, document.body *', elements => {
    const filterElements = elements.filter(element => {
      const elementStyles = window.getComputedStyle(element);
      return elementStyles.filter;
    });
    return filterElements;
  });
  const data = {
    total: filterElements.length
  };
  if (withItems) {
    data.items = [];
    for (const filterElement of filterElements) {
      const tagNameJSHandle = await filterElement.getProperty('tagName');
      const tagName = await tagNameJSHandle.jsonValue();
      const text = compact(await filterElement.textContent());
      const item = {
        tagName,
        text
      };
      data.items.push(item);
    }
  }
  return {result: data};
};
