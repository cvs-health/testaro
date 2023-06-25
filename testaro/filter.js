/*
  filter
  This test reports elements whose styles include filter. The filter style property is considered
  inherently inaccessible, because it modifies the rendering of content, overriding user settings,
  and requires the user to apply custom styles to neutralize it, which is difficult or impossible
  in some user environments.
*/
// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Identify the elements with filter style properties.
  const data = await page.evaluate(withItems => {
    // Returns a space-minimized copy of a string.
    const compact = string => string
    .replace(/[\t\n]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 100);
    // Get all elements in the body.
    const elements = Array.from(document.body.querySelectorAll('*'));
    // Get those that have filter styles.
    const filterElements = elements.filter(element => {
      const elementStyles = window.getComputedStyle(element);
      return elementStyles.filter !== 'none';
    });
    const filterData = filterElements.map(element => ({
      element,
      impact: element.querySelectorAll('*').length
    }));
    // Initialize the result.
    const data = {
      totals: {
        styledElements: filterElements.length,
        impactedElements: filterData.reduce((total, current) => total + current.impact, 0)
      }
    };
    // If itemization is required:
    if (withItems) {
      // Add it to the result.
      data.items = [];
      filterData.forEach(filterDatum => {
        data.items.push({
          tagName: filterDatum.element.tagName,
          id: filterDatum.element.id,
          text: compact(filterDatum.element.textContent) || compact(filterDatum.element.outerHTML),
          impact: filterDatum.impact
        });
      });
    }
    return data;
  }, withItems);
  const totals = [0, data.totals.impactedElements, data.totals.styledElements, 0];
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        ruleID: 'filterStyle',
        what: `${item.tagName} element has a filter style that impacts ${item.impact} elements`,
        ordinalSeverity: 2,
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
  else if (data.totals.styledElements) {
    standardInstances.push({
      ruleID: 'filterStyle',
      what: 'Elements have filter styles impacting other elements',
      ordinalSeverity: 2,
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
