// Tabulates and lists labeling conflicts of labelable form controls.
exports.labClash = async (page, withItems) => await page.$eval('body', (body, withItems) => {
  // FUNCTION DEFINITION START
  const debloat = text => text.trim().replace(/\s+/g, ' ');
  // FUNCTION DEFINITION END
  // Initialize a report.
  const result = {
    totals: {
      wellLabeled: 0,
      unlabeled: 0,
      mislabeled: 0
    }
  };
  if (withItems) {
    result.items = [];
  }
  // Get data on the labelable form controls.
  const labelees = Array.from(
    body.querySelectorAll('button, input:not([type=hidden]), select, textarea')
  );
  // For each one:
  labelees.forEach((labelee, index) => {
    // Determine whether it has any or clashing labels and, if required, the label texts.
    let labelTypes = [];
    let texts = {};
    if (labelee.hasAttribute('aria-label')) {
      labelTypes.push('aria-label');
      if (withItems) {
        texts.attribute = labelee.getAttribute('aria-label');
      }
    }
    if (labelee.hasAttribute('aria-labelledby')) {
      labelTypes.push('aria-labelledby');
      if (withItems) {
        const labelerIDs = debloat(labelee.getAttribute('aria-labelledby')).split(' ');
        const labelerTexts = labelerIDs
        .map(id => {
          const labeler = document.getElementById(id);
          return labeler ? debloat(labeler.textContent) : '';
        })
        .filter(text => text);
        if (labelerTexts.length) {
          texts.referred = labelerTexts;
        }
      }
    }
    const labels = Array.from(labelee.labels);
    if (labels.length) {
      labelTypes.push('label');
      if (withItems) {
        const labelTexts = labels.map(label => debloat(label.textContent)).filter(text => text);
        if (labelTexts.length) {
          texts.label = labelTexts;
        }
      }
    }
    if (withItems && labelee.tagName === 'button') {
      const content = debloat(labelee.textContent);
      if (content) {
        texts.content = content;
      }
    }
    const totals = result.totals;
    const labelTypeCount = labelTypes.length;
    // If it is well labeled:
    if (
      labelTypeCount === 1
      || ! labelTypeCount && labelee.tagName === 'button' && debloat(labelee.textContent).length
    ) {
      // Increment the count of well-labeled items in the report.
      totals.wellLabeled++;
    }
    // Otherwise, if it is unlabeled:
    else if (! labelTypeCount) {
      // Increment the count of unlabeled items in the report.
      totals.unlabeled++;
      // Add data on the item to the report, if required.
      if (withItems) {
        result.items.push({
          index,
          type: labelee.type,
          labelTypes: 'None'
        });
      }
    }
    // Otherwise, if it has clashing labels:
    else if (labelTypeCount > 1) {
      // Increment the count of labeling clashes in the report.
      totals.mislabeled++;
      // Add the data on the item to the report, if required.
      if (withItems) {
        result.items.push({
          index,
          type: labelee.type,
          labelTypes,
          texts
        });
      }
    }
  });
  return {result};
}, withItems);
