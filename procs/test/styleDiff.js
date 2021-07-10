// Tabulates and lists style inconsistencies.
exports.styleDiff = async (page, withDetails) => await page.$eval('body', (body, withDetails) => {
  const data = {totals: {}};
  if (withDetails) {
    data.details = {};
  }
  // Identify the tag names to be analyzed.
  const tagNames = ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  // For each of them:
  tagNames.forEach(tagName => {
    // Get the elements with it.
    const elements = Array.from(body.getElementsByTagName(tagName));
    const elementCount = elements.length;
    // If there are any:
    if (elementCount) {
      const styleProps = {};
      const styleTexts = {};
      // For each of them:
      elements.forEach(element => {
        // Get its style properties.
        const style = {};
        Object.assign(style, window.getComputedStyle(element));
        Object.keys(style).forEach(key => {
          if (/^\d/.test(key) || key.startsWith('webkit')) {
            delete style[key];
          }
        });
        // Get a text representation of the style declaration.
        const styleText = JSON.stringify(style);
        // Increment the total of elements with that style declaration.
        styleTexts[styleText] = ++styleTexts[styleText] || 1;
        // If details are required:
        if (withDetails) {
          // For each style property:
          Object.keys(style).forEach(styleName => {
            const styleValue = style[styleName];
            // Increment the total of elements with the same value on it as the element.
            if (styleProps[styleName]) {
              styleProps[styleName][styleValue] = ++styleProps[styleName][styleValue] || 1;
            }
            else {
              styleProps[styleName] = {[styleValue]: 1};
            }
          });
        }
      });
      // Add the totals to the result.
      data.totals[tagName] = {total: elementCount};
      const styleCounts = Object.values(styleTexts);
      if (styleCounts.length > 1) {
        data.totals[tagName].subtotals = styleCounts.sort((a, b) => b - a);
      }
      // If details are required:
      if (withDetails) {
        // For each style property:
        Object.keys(styleProps).forEach(styleProp => {
          // Ignore it if all the elements have the same value.
          if (Object.keys(styleProps[styleProp]).length === 1) {
            delete styleProps[styleProp];
          }
          // Otherwise:
          else {
            // Sort the values in order of decreasing count.
            const sortedEntries = Object.entries(styleProps[styleProp]).sort((a, b) => b[1] - a[1]);
            data.details[tagName] = {[styleProp]: {}};
            sortedEntries.forEach(entry => {
              data.details[tagName][styleProp][entry[0]] = entry[1];
            });
          }
        });
      }
    }
  });
  return data;
}, withDetails);
