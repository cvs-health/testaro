/*
  styleDiff
  This test reports style differences among links, buttons, and headings. It assumes
  that an accessible page employs few or only one style for adjacent links, and likewise
  for list links, buttons, and headings at each level. The test considers only
  particular style properties, listed in the 'mainStyles' and 'headingStyles' arrays.
*/
exports.reporter = async (page, withItems) => {
  // Get an object with arrays of list links and adjacent links as properties.
  const linkTypes = await require('../procs/linksByType').linksByType(page);
  return await page.$eval('body', (body, args) => {
    const withItems = args[0];
    const linkTypes = args[1];
    // Identify the settable style properties to be compared for all tag names.
    const mainStyles = [
      'fontStyle',
      'fontWeight',
      'opacity',
      'textDecorationLine',
      'textDecorationStyle',
      'textDecorationThickness'
    ];
    // Identify those only for buttons.
    const buttonStyles = [
      'borderStyle',
      'borderWidth',
      'height',
      'lineHeight',
      'maxHeight',
      'maxWidth',
      'minHeight',
      'minWidth',
      'outlineOffset',
      'outlineStyle',
      'outlineWidth'
    ];
    // Identify those for headings.
    const headingStyles = [
      'color',
      'fontSize'
    ];
    // Identify those for list links.
    const listLinkStyles = [
      'color',
      'fontSize',
      'lineHeight'
    ];
    // Initialize the data to be returned.
    const data = {
      mainStyles,
      buttonStyles,
      headingStyles,
      listLinkStyles,
      totals: {}
    };
    if (withItems) {
      data.items = {};
    }
    // Initialize an object of elements to be analyzed, including links.
    const elements = {
      buttons: [],
      headings: {
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      links: {
        adjacent: linkTypes.adjacent,
        list: linkTypes.list
      }
    };
    // Identify the heading tag names to be analyzed.
    const headingNames = Object.keys(elements.headings);
    // Add the buttons to the object.
    elements.buttons = Array.from(body.querySelectorAll('button, input[type=button]'));
    // For each heading tag name:
    headingNames.forEach(tagName => {
      // Add its elements to the object.
      elements.headings[tagName] = Array.from(body.getElementsByTagName(tagName));
    });
    // Tabulates the distribution of style properties for elements of a type.
    const tallyStyles = (typeName, elements, typeStyles) => {
      // If there are any elements:
      const elementCount = elements.length;
      if (elementCount) {
        const styleProps = {};
        const styleTexts = {};
        if (withItems) {
          if (! data.items[typeName]) {
            data.items[typeName] = {};
          }
        }
        // For each element:
        elements.forEach(element => {
          // Get its values on the style properties to be compared.
          const styleDec = window.getComputedStyle(element);
          const style = {};
          // Identify the styles to be compared.
          const styles = mainStyles.concat(typeStyles);
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
        data.totals[typeName] = {total: elementCount};
        const styleCounts = Object.values(styleTexts);
        // If the elements in the element class differ in style:
        if (styleCounts.length > 1) {
          // Add the distribution of its style counts to the result.
          data.totals[typeName].subtotals = styleCounts.sort((a, b) => b - a);
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
              if (! data.items[typeName][styleProp]) {
                data.items[typeName][styleProp] = {};
              }
              // Sort the values in order of decreasing count.
              const sortedEntries = Object.entries(styleProps[styleProp]).sort((a, b) => b[1] - a[1]);
              sortedEntries.forEach(entry => {
                const propData = data.items[typeName][styleProp];
                propData[entry[0]] = (propData[entry[0]] || 0) + entry[1];
              });
            }
          });
        }
      }
    };
    // Report the style-property distributions for the element types.
    tallyStyles('button', elements.buttons, buttonStyles);
    tallyStyles('adjacentLink', elements.links.adjacent, []);
    tallyStyles('listLink', elements.links.list, listLinkStyles);
    headingNames.forEach(headingName => {
      tallyStyles(headingName, elements.headings[headingName], headingStyles);
    });
    return {result: data};
  }, [withItems, linkTypes]);
};
