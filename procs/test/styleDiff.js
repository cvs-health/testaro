// Tabulates and lists style inconsistencies.
exports.styleDiff = async (page, withDetails) => {
  const linkTypes = await require('./linksByType').linksByType(page);
  return await page.$eval('body', (body, args) => {
    const withDetails = args[0];
    const linkTypes = args[1];
    const data = {totals: {}};
    if (withDetails) {
      data.details = {};
    }
    // Identify the settable styles to be compared.
    const mainStyles = [
      'border',
      'color',
      'font',
      'lineHeight',
      'maxHeight',
      'maxWidth',
      'minHeight',
      'minWidth',
      'opacity',
      'outline',
      'textDecoration'
    ];
    // Identify the nonlink tag names to be analyzed.
    const tagNames = ['button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    // Initialize an object of elements to be analyzed.
    const elementClasses = {
      aInline: linkTypes.inline,
      aBlock: linkTypes.block
    };
    // For each nonlink tag name:
    tagNames.forEach(tagName => {
      // Add its elements to the object.
      elementClasses[tagName] = Array.from(body.getElementsByTagName(tagName));
    });
    // For each element class:
    Object.keys(elementClasses).forEach(tagName => {
      const elements = elementClasses[tagName];
      const elementCount = elements.length;
      // If there are any:
      if (elementCount) {
        const styleProps = {};
        const styleTexts = {};
        if (withDetails) {
          if (! data.details[tagName]) {
            data.details[tagName] = {};
          }
        }
        // For each of them:
        elements.forEach(element => {
          // Get its values on the style properties to be compared.
          const styleDec = window.getComputedStyle(element);
          const style = {};
          mainStyles.forEach(styleName => {
            style[styleName] = styleDec[styleName];
          });
          // Get a text representation of the style.
          const styleText = JSON.stringify(style);
          // Increment the total of elements with that style declaration.
          styleTexts[styleText] = ++styleTexts[styleText] || 1;
          // If details are required:
          if (withDetails) {
            // For each style property:
            mainStyles.forEach(styleName => {
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
        // Add the total to the result.
        data.totals[tagName] = {total: elementCount};
        const styleCounts = Object.values(styleTexts);
        // If the elements in the element class differ in style:
        if (styleCounts.length > 1) {
          // Add the distribution of its style counts to the result.
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
              if (! data.details[tagName][styleProp]) {
                data.details[tagName][styleProp] = {};
              }
              // Sort the values in order of decreasing count.
              const sortedEntries = Object.entries(styleProps[styleProp]).sort((a, b) => b[1] - a[1]);
              sortedEntries.forEach(entry => {
                const propData = data.details[tagName][styleProp];
                propData[entry[0]] = (propData[entry[0]] || 0) + entry[1];
              });
            }
          });
        }
      }
    });
    return data;
  }, [withDetails, linkTypes]);
};
