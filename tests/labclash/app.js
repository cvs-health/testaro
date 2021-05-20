// Compiles a report.
exports.reporter = async page => await page.$eval('body', body => {
  // Get data on the non-hidden inputs and the select lists.
  const inputs = Array.from(body.querySelectorAll('input:not([type=hidden]), select'));
  const itemData = [];
  // FUNCTION DEFINITION START
  const debloat = text => text.trim().replace(/\s+/g, ' ');
  // FUNCTION DEFINITION END
  // For each one:
  inputs.forEach((input, index) => {
    // Determine whether it has labeling conflicts.
    let labelTypes = [];
    let texts = [];
    if (input.hasAttribute('aria-label')) {
      labelTypes.push('aria-label');
      texts = [input.getAttribute('aria-label')];
    }
    if (input.hasAttribute('aria-labelledby')) {
      labelTypes.push('aria-labelledby');
      const labelerIDs = input.getAttribute('aria-labelledby').split(/\s+/);
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
    const labels = Array.from(input.labels);
    if (labels.length) {
      labelTypes.push('label');
      const labelTexts = labels.map(label => debloat(label.textContent)).filter(text => text);
      if (labelTexts.length) {
        texts.push(...labelTexts);
      }
    }
    // If it has labeling conflicts:
    if (labelTypes.length > 1) {
      // Compile its data.
      const item = {
        index,
        type: input.type,
        labelTypes,
        text: texts.join('; ')
      };
      // Add its data to the report data.
      itemData.push(item);
    }
  });
  return itemData.length ? itemData : 'NONE';
});
