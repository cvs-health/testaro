/*
  rotation
  This test reports elements whose transform style properties contain rotations. Rotations make
  text difficult to read.
*/
// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Identify the elements with filter style properties.
  const data = await page.$$eval('body *', (elements, withItems) => {
    // Returns a space-minimized copy of a string.
    const compact = string => string
    .replace(/[\t\n]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 200);
    // Get the elements that are rotated.
    const rotatedElements = elements.filter(element => {
      const elementStyleDec = window.getComputedStyle(element);
      const {transform} = elementStyleDec;
      return transform && transform.includes('rotate');
    });
    // Initialize the result.
    const data = {
      total: rotatedElements.length
    };
    // If itemization is required:
    if (withItems) {
      // Add an itemization to the result.
      data.items = [];
      rotatedElements.forEach(rotatedElement => {
        data.items.push({
          tagName: rotatedElement.tagName,
          id: rotatedElement.id || '',
          text: compact(rotatedElement.textContent) || compact(rotatedElement.outerHTML)
        });
      });
    }
    return data;
  }, withItems);
  // Get the totals.
  const totals = [data.total, 0, 0, 0];
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'rotation',
        what: `${item.tagName} element rotates its text`,
        ordinalSeverity: 0,
        tagName: item.tagName.toUpperCase(),
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
      ruleID: 'rotation',
      what: 'Elements rotate their texts',
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
  return {
    data,
    totals,
    standardInstances
  };
};
