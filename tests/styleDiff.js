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
  return await page.$eval('body', (body, linkTypes) => {
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
    const tallyStyles = (typeName, elements, typeStyles, withItems) => {
      // If there are any elements:
      const elementCount = elements.length;
      if (elementCount) {
        const styleProps = {};
        const styleTexts = {};
        if (! data.styleTotals[typeName]) {
          data.styleTotals[typeName] = {};
        }
        // For each element:
        elements.forEach(element => {
          // Get its values on the style properties to be compared.
          const styleDec = window.getComputedStyle(element);
          const style = {};
          const styles = mainStyles.concat(typeStyles);
          styles.forEach(styleName => {
            style[styleName] = styleDec[styleName];
          });
          // Get a text representation of the style, limited to those properties.
          const styleText = JSON.stringify(style);
          // Increment the total of elements with that style.
          styleTexts[styleText] = ++styleTexts[styleText] || 1;
          // If details are to be reported:
          if (withItems) {
            // Add the element’s values and text to the style details.
            if (! styleProps[typeName]) {
              styleProps[typeName] = {};
            }
            const elementText = element.textContent.trim().replace(/\s/c, ' ');
            // For each style property being compared:
            styles.forEach(styleName => {
              if (! styleProps[typeName][styleName]) {
                styleProps[typeName][styleName] = {};
              }
              if (! styleProps[typeName][styleName][style[styleName]]) {
                styleProps[typeName][styleName][style[styleName]] = [];
              }
              styleProps[typeName][styleName][style[styleName]].push(elementText);
            });
          }
        });
        // Add the total to the result.
        data.totals[typeName] = {total: elementCount};
        const styleCounts = Object.values(styleTexts);
        // If the elements of the type differ in style:
        if (styleCounts.length > 1) {
          // Add the distribution of its style counts to the result.
          data.totals[typeName].subtotals = styleCounts.sort((a, b) => b - a);
          // If details are to be reported:
          if (withItems) {
            // Add the element values and texts to the result.
            data.items[typeName] = styleProps[typeName];
          }
        }
      }
    };
    // Report the style-property distributions for the element types.
    tallyStyles('button', elements.buttons, buttonStyles, withItems);
    tallyStyles('adjacentLink', elements.links.adjacent, [], withItems);
    tallyStyles('listLink', elements.links.list, listLinkStyles, withItems);
    headingNames.forEach(headingName => {
      tallyStyles(headingName, elements.headings[headingName], headingStyles, withItems);
    });
    return {result: data};
  }, linkTypes);
};
