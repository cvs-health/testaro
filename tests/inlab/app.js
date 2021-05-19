// Compiles a report.
exports.reporter = async page => {
  return await page.$eval('body', body => {
    // Get data on the fieldsets and their legends and inputs.
    const fieldSets = Array.from(body.getElementsByTagName('fieldset'));
    const fieldSetMap = new Map();
    fieldSets.forEach(fieldSet => {
      const legend = fieldSet.firstElementChild;
      if (legend && legend.tagName === 'LEGEND') {
        const legendText = legend.textContent;
        if (legendText) {
          const inputs = Array.from(fieldSet.querySelectorAll('input, select'));
          inputs.forEach(input => {
            if (fieldSetMap.has(input)) {
              fieldSetMap.set(input, `${fieldSetMap.get(input)}; ${legendText}`);
            }
            else {
              fieldSetMap.set(input, legendText);
            }
          });
        }
      }
    });
    // Get data on the non-hidden inputs and the select lists.
    const inputs = Array.from(body.querySelectorAll('input:not([type=hidden]), select'));
    const itemData = [];
    // FUNCTION DEFINITION START
    const debloat = text => text.trim().replace(/\s+/g, ' ');
    // FUNCTION DEFINITION END
    // For each one:
    inputs.forEach((input, index) => {
      // Initialize an object of data about it.
      const item = {index};
      // Add its type.
      item.type = input.type;
      // Add its fieldset legend, if any.
      if (fieldSetMap.has(input)) {
        item.legend = debloat(fieldSetMap.get(input));
      }
      // Add its aria-label attribute, if any.
      const ariaLabel = input.getAttribute('aria-label');
      if (ariaLabel) {
        const trimmedLabel = debloat(ariaLabel);
        if (trimmedLabel) {
          item.ariaLabel = trimmedLabel;
        }
      }
      // Add its explicit and implicit label elements’ texts, if any.
      const labelNodeList = input.labels;
      if (labelNodeList.length) {
        const labels = Array.from(labelNodeList);
        const labelTexts = labels
        .map(el => el.textContent && debloat(el.textContent))
        .filter(text => text);
        if (labelTexts.length) {
          item.labels = labelTexts;
        }
      }
      // Add its referenced labels’ texts, if any.
      if (input.hasAttribute('aria-labelledby')) {
        const labelerIDs = input.getAttribute('aria-labelledby').split(/\s+/);
        labelerIDs.forEach(id => {
          const labeler = document.getElementById(id);
          if (labeler) {
            const labelerText = debloat(labeler.textContent);
            if (item.labelers) {
              item.labelers.push(labelerText);
            }
            else {
              item.labelers = [labelerText];
            }
          }
        });
      }
      // Add its data to the report data.
      itemData.push(item);
    });
    return itemData.length ? itemData : 'NONE';
  });
};
