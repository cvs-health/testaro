/*
  styleDiff
  This test reports style differences among links, buttons, and headings. It assumes
  that an accessible page employs few or only one style for inline links, and likewise
  for non-inline links, buttons, and headings at each level. The test considers only
  particular style properties, listed in the 'mainStyles' and 'headingStyles' arrays.
*/
exports.reporter = async (page, withItems) => {
  // Get an object with arrays of block and inline links as properties.
  const linkTypes = await require('../procs/linksByType').linksByType(page);
  return await page.$eval('body', (body, args) => {
    const withItems = args[0];
    const linkTypes = args[1];
    // Identify the settable style properties to be compared for all tag names.
    const mainStyles = [
      'borderStyle',
      'borderWidth',
      'fontStyle',
      'fontWeight',
      'lineHeight',
      'maxHeight',
      'maxWidth',
      'minHeight',
      'minWidth',
      'opacity',
      'outlineOffset',
      'outlineStyle',
      'outlineWidth',
      'textDecorationLine',
      'textDecorationStyle',
      'textDecorationThickness'
    ];
    // Identify those for headings.
    const headingStyles = [
      'fontSize'
    ];
    // Initialize the data to be returned.
    const data = {
      mainStyles,
      headingStyles,
      totals: {}
    };
    if (withItems) {
      data.items = {};
    }
    // Identify the heading tag names to be analyzed.
    const headingNames = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    // Identify the other nonlink tag names to be analyzed.
    const otherNames = ['button'];
    // Initialize an object of elements to be analyzed.
    const elementClasses = {
      headings: {},
      other: {
        aInline: linkTypes.inline,
        aBlock: linkTypes.block
      }
    };
    // For each heading tag name:
    headingNames.forEach(tagName => {
      // Add its elements to the object.
      elementClasses.headings[tagName] = Array.from(body.getElementsByTagName(tagName));
    });
    // For each other tag name:
    otherNames.forEach(tagName => {
      // Add its elements to the object.
      elementClasses.other[tagName] = Array.from(body.getElementsByTagName(tagName));
    });
    // For each element superclass:
    ['headings', 'other'].forEach(superClass => {
      // For each class in the superclass:
      Object.keys(elementClasses[superClass]).forEach(tagName => {
        const elements = elementClasses[superClass][tagName];
        const elementCount = elements.length;
        // If there are any:
        if (elementCount) {
          const styleProps = {};
          const styleTexts = {};
          if (withItems) {
            if (! data.items[tagName]) {
              data.items[tagName] = {};
            }
          }
          // For each of them:
          elements.forEach(element => {
            // Get its values on the style properties to be compared.
            const styleDec = window.getComputedStyle(element);
            const style = {};
            // Identify the styles to be compared.
            const styles = mainStyles;
            if (superClass === 'headings') {
              styles.push(...headingStyles);
            }
            styles.forEach(styleName => {
              style[styleName] = styleDec[styleName];
            });
            // Get a text representation of the style.
            const styleText = JSON.stringify(style);
            // Increment the total of elements with that style declaration.
            styleTexts[styleText] = ++styleTexts[styleText] || 1;
            // If details are required:
            if (withItems) {
              // For each style property:
              styles.forEach(styleName => {
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
          if (withItems) {
            // For each style property:
            Object.keys(styleProps).forEach(styleProp => {
              // Ignore it if all the elements have the same value.
              if (Object.keys(styleProps[styleProp]).length === 1) {
                delete styleProps[styleProp];
              }
              // Otherwise:
              else {
                if (! data.items[tagName][styleProp]) {
                  data.items[tagName][styleProp] = {};
                }
                // Sort the values in order of decreasing count.
                const sortedEntries = Object.entries(styleProps[styleProp]).sort((a, b) => b[1] - a[1]);
                sortedEntries.forEach(entry => {
                  const propData = data.items[tagName][styleProp];
                  propData[entry[0]] = (propData[entry[0]] || 0) + entry[1];
                });
              }
            });
          }
        }
      });
    });
    return {result: data};
  }, [withItems, linkTypes]);
};
