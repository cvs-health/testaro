// Lists labeling conflicts of input and select elements.
exports.labClash = async (page, withItems) => await page.$eval('body', body => {
  // FUNCTION DEFINITION START
  const debloat = text => text.trim().replace(/\s+/g, ' ');
  // FUNCTION DEFINITION END
  // Initialize a report.
  const result = {
    totals: {
      wellLabeled: 0,
      unlabeled: 0,
      clashLabeled: 0
    }
  };
  if (withItems) {
    result.items = [];
  }
  // Get data on the inputs and select lists.
  const labelees = Array.from(body.querySelectorAll('input, select'));
  // For each one:
  labelees.forEach((labelee, index) => {
    // Determine whether it has any or clashing labels and, if required, the label texts.
    let labelTypes = [];
    let texts = [];
    if (labelee.hasAttribute('aria-label')) {
      labelTypes.push('aria-label');
      if (withItems) {
        texts = [labelee.getAttribute('aria-label')];
      }
    }
    if (labelee.hasAttribute('aria-labelledby')) {
      labelTypes.push('aria-labelledby');
      const labelerIDs = debloat(labelee.getAttribute('aria-labelledby')).split(' ');
      if (withItems) {
        const labelerTexts = labelerIDs
        .map(id => {
          const labeler = document.getElementById(id);
          return labeler ? debloat(labeler.textContent) : '';
        })
        .filter(text => text);
        if (labelerTexts.length) {
          texts.push(...labelerTexts);
        }
      }
    }
    const labels = Array.from(labelee.labels);
    if (labels.length) {
      labelTypes.push('label');
      if (withItems) {
        const labelTexts = labels.map(label => debloat(label.textContent)).filter(text => text);
        if (labelTexts.length) {
          texts.push(...labelTexts);
        }
      }
    }
    const totals = result.totals;
    const labelTypeCount = labelTypes.length;
    // If it is well labeled:
    if (labelTypeCount === 1) {
      // Increment the count of well-labeled items in the report.
      totals.wellLabeled++;
    }
    // Otherwise, if it is unlabeled:
    else if (labelTypeCount === 0) {
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
    else if (labelTypes.length > 1) {
      // Increment the count of labeling clashes in the report.
      totals.clashLabeled++;
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
});
