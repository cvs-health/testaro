/*
  distortion
  Related to Tenon rule 271.
  This test reports elements whose transform style properties distort the content. Distortion makes
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
    // Get the elements that are distorted.
    const distortedElements = elements.filter(element => {
      const elementStyleDec = window.getComputedStyle(element);
      const {transform} = elementStyleDec;
      return transform
      && ['matrix', 'perspective', 'rotate', 'scale', 'skew'].some(key => transform.includes(key));
    });
    // Initialize the result.
    const data = {
      total: distortedElements.length
    };
    // If itemization is required:
    if (withItems) {
      // Add an itemization to the result.
      data.items = [];
      distortedElements.forEach(distortedElement => {
        data.items.push({
          tagName: distortedElement.tagName,
          id: distortedElement.id || '',
          text: compact(distortedElement.textContent) || compact(distortedElement.outerHTML)
        });
      });
    }
    return data;
  }, withItems);
  // Get the totals.
  const totals = [0, data.total, 0, 0];
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'distortion',
        what: `${item.tagName} element distorts its text`,
        ordinalSeverity: 1,
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
      ruleID: 'distortion',
      what: 'Elements distort their texts',
      ordinalSeverity: 1,
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
