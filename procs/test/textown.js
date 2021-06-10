// Returns the text contents of an element and its labels.
exports.textOwn = (page, elementHandle) => page.evaluate(element => {
  // Initialize an array of the texts.
  const elementTexts = [];
  // FUNCTION DEFINITION START
  const debloat = text => text.trim().replace(/\s+/g, ' ');
  // FUNCTION DEFINITION END
  // Add any attribute label to the array.
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    const trimmedLabel = debloat(ariaLabel);
    if (trimmedLabel) {
      elementTexts.push(trimmedLabel);
    }
  }
  // Add any explicit and implicit labels to the array.
  const labelNodeList = element.labels;
  if (labelNodeList.length) {
    const labels = Array.from(labelNodeList);
    const labelTexts = labels
    .map(el => el.textContent && debloat(el.textContent))
    .filter(text => text);
    if (labelTexts.length) {
      elementTexts.push(...labelTexts);
    }
  }
  // Add any referenced labels to the array.
  if (element.hasAttribute('aria-labelledby')) {
    const labelerIDs = element.getAttribute('aria-labelledby').split(/\s+/);
    labelerIDs.forEach(id => {
      const labeler = document.getElementById(id);
      if (labeler) {
        const labelerText = debloat(labeler.textContent);
        if (labelerText) {
          elementTexts.push(labelerText);
        }
      }
    });
  }
  return elementTexts.join('; ');
}, elementHandle);
