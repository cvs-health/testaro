/*
  allSlanted
  This test reports leaf elements whose text contents are at least 40 characters long and are
  entirely italic or oblique. Blocks of italic or oblique text are difficult to read.
*/
// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Identify the elements with upper-case text longer than 7 characters.
  const data = await page.$$eval('body *', (elements, withItems) => {
    // Returns a space-minimized copy of a string.
    const compact = string => string
    .replace(/[\t\n]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 100);
    // Get the leaf elements.
    const leafElements = elements.filter(element => ! element.children.length);
    // Get those with text contents longer than 39 characters.
    const textElements = leafElements.filter(element => compact(element.textContent).length > 39);
    // Get those with italic or oblique text.
    const allSlantedElements = textElements.filter(element => {
      const styleDec = window.getComputedStyle(element);
      return ['italic', 'oblique'].includes(styleDec['font-style']);
    });
    // Initialize the result.
    const data = {
      total: allSlantedElements.length
    };
    // If itemization is required:
    if (withItems) {
      // Add an itemization to the result.
      data.items = [];
      allSlantedElements.forEach(allSlantedElement => {
        data.items.push({
          tagName: allSlantedElement.tagName,
          id: allSlantedElement.id || '',
          text: compact(allSlantedElement.textContent)
        });
      });
    }
    return data;
  }, withItems);
  // Get the totals.
  const totals = [data.total, 0, 0, 0];
  // Get the required standard instances.
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'allSlanted',
        what: `${item.tagName} element has entirely italic or oblique text`,
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
      ruleID: 'allSlanted',
      what: 'Elements have entirely italic or oblique texts',
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
