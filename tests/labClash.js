/*
  labClash
  This test reports labeling conflicts of labelable form controls.

  It examines buttons, non-hidden inputs, select lists, and text areas. It reports
  such a control as well-labeled if the control has text content or is labeled with a single
  labeling method. If the control is labeled with more than one labeling method, so that
  any label is superseded and ignored, the test reports the control as mislabeled. If the
  control has no text content and no label, it is reported as unlabeled.
*/
exports.reporter = async (page, withItems) => {
  return await page.$eval('body', (body, withItems) => {
    // FUNCTION DEFINITION START
    const debloat = text => text.trim().replace(/\s+/g, ' ');
    // FUNCTION DEFINITION END
    // Initialize a report.
    const data = {
      totals: {
        mislabeled: 0,
        unlabeled: 0,
        wellLabeled: 0
      }
    };
    if (withItems) {
      data.items = {
        mislabeled: [],
        unlabeled: [],
        wellLabeled: []
      };
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
      // Attribute label.
      if (labelee.hasAttribute('aria-label')) {
        labelTypes.push('aria-label');
        if (withItems) {
          texts.attribute = labelee.getAttribute('aria-label');
        }
      }
      // Reference label.
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
      // Explicit and implicit labels.
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
      // Content label if details required.
      if (withItems) {
        // Of button.
        if (labelee.tagName === 'BUTTON') {
          const content = debloat(labelee.textContent);
          if (content) {
            texts.content = content;
          }
        }
        // Of submit input.
        else if (labelee.tagName === 'INPUT' && labelee.type === 'submit' && labelee.value) {
          const content = debloat(labelee.value);
          if (content) {
            texts.content = content;
          }
        }
      }
      const {totals} = data;
      const labelTypeCount = labelTypes.length;
      // If it is well labeled:
      if (
        labelTypeCount === 1
        || ! labelTypeCount && (
          labelee.tagName === 'BUTTON' && debloat(labelee.textContent).length
          || labelee.tagName === 'INPUT' && labelee.type === 'submit' && labelee.value
        )
      ) {
        // Increment the count of well-labeled items in the report.
        totals.wellLabeled++;
        // Add data on the item to the report, if required.
        if (withItems) {
          data.items.wellLabeled.push({
            index,
            tagName: labelee.tagName,
            type: labelee.type,
            labelType: labelTypes[0],
            texts
          });
        }
      }
      // Otherwise, if it is unlabeled:
      else if (! labelTypeCount) {
        // Increment the count of unlabeled items in the report.
        totals.unlabeled++;
        // Add data on the item to the report, if required.
        if (withItems) {
          const item = {
            index,
            tagName: labelee.tagName,
            type: labelee.type
          };
          if (
            labelee.tagName === 'BUTTON'
            || (labelee.tagName === 'INPUT' && labelee.type === 'submit')
          ) {
            item.content = texts.content || `{${debloat(labelee.outerHTML)}}`;
          }
          data.items.unlabeled.push(item);
        }
      }
      // Otherwise, if it has clashing labels:
      else if (labelTypeCount > 1) {
        // Increment the count of labeling clashes in the report.
        totals.mislabeled++;
        // Add the data on the item to the report, if required.
        if (withItems) {
          data.items.mislabeled.push({
            index,
            tagName: labelee.tagName,
            type: labelee.type,
            labelTypes,
            texts
          });
        }
      }
    });
    return {result: data};
  }, withItems)
  .catch(error => {
    console.log(`ERROR: labClash failed (${error.message})`);
    const data = {error: 'ERROR: labClash failed'};
    return {result: data};
  });
};
