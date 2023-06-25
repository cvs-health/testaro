/*
  pseudoP
  This test reports 2 or more sequential br elements. They may be inferior substitutes for a
  p element.
*/
// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Identify the elements containing 2 or more consecutive br elements.
  const data = await page.evaluate('br + br', br2s => {
    // Returns a space-minimized copy of a string.
    const compact = string => string
    .replace(/[\t\n]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 100);
    // Initialize a set of the parent elements of successive br elements.
    const dataSet = new Set([]);
    // For each br element with an immediately preceding br sibling:
    br2s.forEach(br2 => {
      // Add it to the data.
      const parent = br2.parentElement;
      dataSet.add(parent);
    });
    // Initialize data on the parents.
    const data = [];
    dataSet.forEach(parent => {
      data.push({
        tagName: parent.tagName,
        id: parent.id || '',
        text: compact(parent.textContent)
      });
    });
  });
  // Initialize the standard result.
  const totals = [data.length, 0, 0, 0];
  // If there are any instances:
  const standardInstances = [];
  if (data.length) {
    // If itemization is required:
    if (withItems) {
      // Add the instances to the standard result.
      data.forEach(item => {
        standardInstances.push({
          ruleID: 'pseudoP',
          what: `${item.tagName} element contains 2 or more adjacent br elements that may be nonsemantic substitute for a p element`,
          ordinalSeverity: 0,
          tagName: item.tagName.toUpperCase(),
          id: item.id,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item.text.slice(0, 200)
        });
      });
    }
    // Otherwise, i.e. if itemization is not required:
    else {
      // Add a summary instance to the standard result.
      standardInstances.push({
        ruleID: 'pseudoP',
        what: 'Elements contain 2 or more adjacent br elements that may be nonsemantic substitutes for p elements',
        ordinalSeverity: 2,
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
      data.length = 0;
    }
  }
  // Return the result and the standard result.
  return {
    data,
    totals,
    standardInstances
  };
};
