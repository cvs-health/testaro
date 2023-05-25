/*
  titledEl
  Derived from the bbc-a11y titleAttributesOnlyOnInputs test.
  This test reports title attributes on inappropriate elements.
*/
exports.reporter = async (page, withItems) => {
  // Identify the inappropriate elements with title attributes.
  const badTitleElements = await page.$$eval(
    '[title]:not(input, button, textarea, select, iframe):visible',
    badTitleElements => {
      // FUNCTION DEFINITION START
      // Returns a space-minimized copy of a string.
      const compact = string => string
        ? string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim()
        : '';
      // FUNCTION DEFINITION END
      return badTitleElements.map(element => ({
        tagName: element.tagName,
        text: compact(element.textContent),
        title: compact(element.title)
      }));
    }
  );
  const data = {
    total: badTitleElements.length
  };
  const standardInstances = [];
  if (withItems) {
    data.items = badTitleElements;
    badTitleElements.forEach(element => {
      standardInstances.push({
        issueID: 'titledEl',
        what: `Element ${element.tagName} has a title attribute`,
        ordinalSeverity: 0,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: `${element.tagName} (${element.text}): ${element.title}`
      });
    });
  }
  return {
    data,
    totals: [data.total],
    standardInstances
  };
};
