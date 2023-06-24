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
      const data = [];
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
        // Get its styles.
        const styleDec = window.getComputedStyle(eligible);
        const widthString = styleDec.width;
        const widthNum = Number.parsFloat(widthString);
        const heightString = styleDec.height;
        const heightNum = Number.parsFloat(heightString);
        if (widthNum < 44 || heightNum < 44) {
          data.push({
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
  const totals = [data.length, 0, 0, 0];
  const standardInstances = [];
  if (withItems) {
    data.forEach(item => {
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
  else {
    standardInstances.push({
      ruleID: 'targetSize',
      what: 'Interactive elements have substandard sizes (less than 44 px wide or high)',
      ordinalSeverity: 0,
      count: data.length,
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
  return {
    data,
    totals,
    standardInstances
  };
};
