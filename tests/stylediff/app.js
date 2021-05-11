// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.perform(debug);
      // Get data.
      const data = await page.$eval('body', (body, elementType) => {
        // Get data on the style declarations of links.
        const styleDecs = Array
        .from(body.getElementsByTagName(elementType))
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
              props[styleName] = {
                [styleValue]: 1
              };
            }
          }
        });
        // For each style property:
        Object.keys(props).forEach(prop => {
          // If all links share a value of it:
          if (Object.keys(props[prop]).length === 1) {
            // Delete it
            delete props[prop];
          }
          // Otherwise, i.e. if any links differ in values of it:
          else {
            // Sort the values in order of decreasing count.
            const sortedValues = Object.entries(props[prop]).sort((a, b) => b[1] - a[1]);
            props[prop] = {};
            sortedValues.forEach(value => {
              props[prop][value[0]] = value[1];
            });
          }
        });
        return [styleDecs.length, props];
      }, query.elementType);
      // Render and serve a report.
      query.elementCount = data[0];
      query.report = Object.keys(data[1]).length ? JSON.stringify(data[1], null, 2) : '<strong>None</strong>';
      globals.render('stylediff', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
