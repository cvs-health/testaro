/*
  targetSize
  Related to Tenon rule 152, but stricter.
  This test reports buttons, inputs, and non-inline links with widths or heights smaller than 44 pixels.
*/
exports.reporter = async (page, withItems) => {
  // Identify the buttons, inputs, and non-inline links smaller than 44 pixels.
  const data = await page.$$eval(
    // Identify all buttons, inputs, and links.
    'button, input, a',
    suspects => {
      // Initialize the result.
      const data = {
        total: 0,
        items: []
      };
      // FUNCTION DEFINITION START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
      // FUNCTION DEFINITION END
      // Identify the buttons, inputs, and non-inline links.
      const eligibles = suspects.filter(suspect => {
        if (['BUTTON', 'INPUT'].includes(suspect.tagName)) {
          return true;
        }
        else {
          const parent = suspect.parentElement;
          return (['DIV', 'P'].includes(parent.tagName) && parent.children.length === 1);
        }
      });
      // For each of them:
      eligibles.forEach(eligible => {
        // If its size is substandard:
        const styleDec = window.getComputedStyle(eligible);
        const widthString = styleDec.width;
        const widthNum = Number.parseFloat(widthString);
        const heightString = styleDec.height;
        const heightNum = Number.parseFloat(heightString);
        if (widthNum < 44 || heightNum < 44) {
          // Add it to the result.
          data.total++;
          data.items.push({
            width: widthNum,
            height: heightNum,
            tagName: eligible.tagName,
            id: eligible.id || '',
            text: compact(eligible.textContent)
          });
        }
      });
      return data;
    }
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
