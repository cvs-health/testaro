// Compiles a report.
exports.reporter = async page => await page.$eval('body', body => [
  'a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
].map(tagName => {
  // Get data on the style declarations of elements of that type.
  const styleDecs = Array
  .from(body.getElementsByTagName(tagName))
  .map(element => window.getComputedStyle(element));
  // Tabulate the properties of the style declarations.
  const props = {};
  styleDecs.forEach(styleDec => {
    for (let i = 0; i < styleDec.length; i++) {
      const styleName = styleDec[i];
      const styleValue = styleDec.getPropertyValue(styleName);
      if (props[styleName]) {
        if (props[styleName][styleValue]) {
          props[styleName][styleValue]++;
        }
        else {
          props[styleName][styleValue] = 1;
        }
      }
      else {
        props[styleName] = {[styleValue]: 1};
      }
    }
  });
  const propNames = Object.keys(props);
  // For each style property:
  propNames.forEach(propName => {
    // If all the elements share a value of it:
    if (Object.keys(props[propName]).length === 1) {
      // Delete it
      delete props[propName];
    }
    // Otherwise, i.e. if any of the elements differ in values of it:
    else {
      // Sort the values in order of decreasing count.
      const sortedEntries = Object.entries(props[propName]).sort((a, b) => b[1] - a[1]);
      // Replace the property with its sorted version.
      props[propName] = {};
      sortedEntries.forEach(value => {
        props[propName][value[0]] = value[1];
      });
    }
  });
  return {
    result: {
      tagName,
      elementCount: styleDecs.length,
      inconsistencies: props
    }
  };
}));
