// Handles a form submission.
exports.formHandler = globals => {
  const {query} = globals;
  if (globals.queryIncludes(['actFileOrURL'])) {
    const debug = false;
    (async () => {
      // Perform the specified preparations.
      const page = await globals.getPageState(debug);
      // Get data.
      const linkData = await page.$eval('body', body => {
        // Get data on the style declarations of links.
        const linkStyleDecs = Array
        .from(body.getElementsByTagName('a'))
        .map(link => window.getComputedStyle(link));
        // Tabulate the properties of the style declarations.
        const props = {};
        linkStyleDecs.forEach(styleDec => {
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
        return props;
      });
      // Render and serve a report.
      query.report = Object.keys(linkData).length ? JSON.stringify(linkData, null, 2) : 'NONE';
      globals.render('linkdiff', true);
    })();
  }
  else {
    globals.serveMessage('ERROR: Some information missing or invalid.', globals.response);
  }
};
