// Returns the text contents of an element and its labels.
exports.allText = (page, elementHandle) => page.evaluate(element => {
  // Identify the element, if specified, or else the focused element.
  const el = element || document.activeElement;
  // Initialize an array of its texts.
  const texts = [];
  // FUNCTION DEFINITION START
  const debloat = text => text.trim().replace(/\s+/g, ' ');
  // FUNCTION DEFINITION END
  // Add any attribute label to the array.
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) {
    const trimmedLabel = debloat(ariaLabel);
    if (trimmedLabel) {
      texts.push(trimmedLabel);
    }
  }
  // Add any explicit and implicit labels to the array.
  const labelNodeList = el.labels;
  if (labelNodeList && labelNodeList.length) {
    const labels = Array.from(labelNodeList);
    const labelTexts = labels
    .map(label => label.textContent && debloat(label.textContent))
    .filter(text => text);
    if (labelTexts.length) {
      texts.push(...labelTexts);
    }
  }
  // Add any referenced labels to the array.
  if (el.hasAttribute('aria-labelledby')) {
    const labelerIDs = el.getAttribute('aria-labelledby').split(/\s+/);
    labelerIDs.forEach(id => {
      const labeler = document.getElementById(id);
      if (labeler) {
        const labelerText = debloat(labeler.textContent);
        if (labelerText) {
          texts.push(labelerText);
        }
      }
    });
  }
  // Add any text content of the element to the array.
  const ownText = element.textContent;
  if (ownText) {
    const minText = debloat(ownText);
    if (minText) {
      texts.push(minText);
    }
  }
  // Add the values of any alt attributes to the array.
  const altText = await element.$$eval('img[alt]:not([alt=""])', els => {
    return els.map(el => el.alt).join('; ');
  });
  if (altText) {
    texts.push(altText);
  }
  if (ownText) {
    const minText = debloat(ownText);
    if (minText) {
      texts.push(minText);
    }
  }
  // Return a concatenation of the texts in the array.
  return texts.join('; ');
}, elementHandle);
