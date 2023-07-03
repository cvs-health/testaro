/*
  targetSize
  Related to Tenon rule 152, but stricter.
  This test reports buttons, inputs, and non-inline links with widths or heights smaller than 44 pixels.
*/
exports.reporter = async (page, withItems) => {
  // Identify the buttons, inputs, and non-inline links smaller than 44 pixels.
  const linkTypesJSHandle = await require('../procs/linksByType').linksByType(page);
  const data = await page.$$eval(
    // Identify all buttons, inputs, and links.
    'button, input',
    (suspects, linkTypesJSHandle) => {
      // Initialize the result.
      const data = {
        total: 0,
        items: []
      };
      // FUNCTION DEFINITIONS START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
      const textsOf = element => {
        const textContent = element.textContent;
        const ariaLabel = element.ariaLabel;
        const labeler = element.labels
          ? Array.from(element.labels).map(label => label.textContent).join(' ')
          : '';
        const refLabelID = element.getAttribute('aria-labelledby');
        const refLabel = refLabelID ? document.getElementById(refLabelID).textContent : '';
        const texts = [];
        [textContent, ariaLabel, labeler, refLabel].forEach(textType => {
          if (textType) {
            const compactTextType = compact(textType);
            if (compactTextType) {
              texts.push(compactTextType);
            }
          }
        });
        return texts.join(' ');
      };
      // FUNCTION DEFINITIONS END
      // Identify the buttons, inputs, and non-inline links.
      const eligibles = suspects.concat(linkTypesJSHandle.list);
      // For each of them:
      eligibles.forEach(eligible => {
        // If its size is substandard:
        const width = eligible.offsetWidth;
        const height = eligible.offsetHeight;
        if (width < 44 || height < 44) {
          console.log('Adding to result');
          // Add it to the result.
          data.total++;
          data.items.push({
            width: width,
            height: height,
            tagName: eligible.tagName,
            id: eligible.id || '',
            text: textsOf(eligible)
          });
        }
      });
      return data;
    }, linkTypesJSHandle
  );
  // Initialize the standard result.
  const totals = [data.total, 0, 0, 0];
  const standardInstances = [];
  // If itemization was requested:
  if (withItems) {
    // Add it to the standard result.
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'targetSize',
        what:
        `Interactive element has a substandard size (${item.width} px wide, ${item.height} px high)`,
        ordinalSeverity: 0,
        tagName: item.tagName,
        id: item.id,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item.text
      });
    });
  }
  // Otherwise, i.e. if itemization was not requested:
  else {
    // Delete the items from the result.
    data.items = [];
    // Add a summary instance to the standard result.
    standardInstances.push({
      ruleID: 'targetSize',
      what: 'Interactive elements are smaller than 44 px wide and high',
      ordinalSeverity: 0,
      count: data.total,
      tagName: '',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  // Return the result and standard result.
  return {
    data,
    totals,
    standardInstances
  };
};
