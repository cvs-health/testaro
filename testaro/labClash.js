/*
  labClash
  This test reports defects in the labeling of buttons, non-hidden inputs, select lists, and
  text areas. The defects include missing labels and redundant labels. Redundant labels are
  labels that are superseded by other labels. Explicit and implicit (wrapped) labels are
  additive, not conflicting.
*/
exports.reporter = async (page, withItems) => {
  return await page.$eval('body', (body, withItems) => {
    // FUNCTION DEFINITION START
    const debloat = text => text ? text.replace(/\s+/g, ' ').trim().slice(0, 100) : '';
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
        const trimmedLabel = debloat(labelee.ariaLabel);
        if (trimmedLabel) {
          labelTypes.push('aria-label');
          if (withItems) {
            texts.attribute = labelee.ariaLabel;
          }
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
      // Content label.
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
      // Of image input.
      else if (labelee.tagName === 'INPUT' && labelee.type === 'image' && labelee.alt) {
        const content = debloat(labelee.alt);
        if (content) {
          texts.content = content;
        }
      }
      // If the control has neither labeling nor content text:
      const allTexts = Object.values(texts);
      const allText = allTexts.filter(text => text.length).join('; ');
      if (! allText) {
        texts.code = debloat(labelee.outerHTML);
      }
      const {totals} = data;
      const labelTypeCount = labelTypes.length;
      // If it is well labeled:
      if (labelTypeCount === 1 || (texts.content && ! labelTypeCount)) {
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
            type: labelee.type,
            texts
          };
          if (
            labelee.tagName === 'BUTTON'
            || (labelee.tagName === 'INPUT' && labelee.type === 'submit')
          ) {
            item.content = debloat(texts.content) || debloat(labelee.outerHTML);
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
            id: labelee.id,
            type: labelee.type,
            labelTypes,
            texts
          });
        }
      }
    });
    // Initialize the standard data.
    const totals = [0, 0, data.totals.mislabeled, data.totals.unlabeled];
    const standardInstances = [];
    // If itemization is required:
    if (data.items) {
      // For each defect type:
      ['mislabeled', 'unlabeled'].forEach(issue => {
        // For each control with that defect type:
        let diagnosis;
        let excerptTail;
        data.items[issue].forEach(item => {
          // Add a standard instance.
          if (issue === 'mislabeled') {
            diagnosis = `has clashing labels of types: ${item.labelTypes.join(', ')}`;
            excerptTail = debloat(Object.values(item.texts).join(' '));
          }
          else {
            diagnosis = 'is unlabeled';
            excerptTail = item.content || item.texts.code;
          }
          standardInstances.push({
            ruleID: 'labClash',
            what: `Element ${item.tagName} ${diagnosis}`,
            ordinalSeverity: issue === 'mislabeled' ? 2 : 3,
            tagName: item.tagName,
            id: item.id,
            location: {
              doc: '',
              type: '',
              spec: ''
            },
            excerpt: excerptTail
          });
        });
      });
    }
    // Otherwise, i.e. if itemization is not required:
    else {
      if (data.totals.unlabeled) {
        standardInstances.push({
          ruleID: 'labClash',
          what: 'Element labels are missing',
          count: data.totals.unlabeled,
          ordinalSeverity: 3,
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
      if (data.totals.mislabeled) {
        standardInstances.push({
          ruleID: 'labClash',
          what: 'Element labels are conflicting',
          count: data.totals.mislabeled,
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
    }
    return {
      data,
      totals,
      standardInstances
    };
  }, withItems)
  .catch(error => {
    console.log(`ERROR: labClash failed (${error.message})`);
    const data = {
      prevented: true,
      error: 'ERROR: labClash failed'
    };
    return {
      data,
      totals: [],
      standardInstances: []
    };
  });
};
