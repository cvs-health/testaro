// Returns the text associated with an element.
exports.allText = async (page, elementHandle) => await page.evaluate(element => {
  // Identify the element, if specified, or else the focused element.
  const el = element || document.activeElement;
  // Initialize an array of its texts.
  const texts = [];
  // FUNCTION DEFINITION START
  // Removes excess spacing from a string.
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
  // Add any image text alternatives to the array.
  const altTexts = Array
  .from(element.querySelectorAll('img[alt]:not([alt=""])'))
  .map(img => debloat(img.alt))
  .join('; ');
  if (altTexts.length) {
    texts.push(altTexts);
  }
  // Add the first 100 characters of any text content of the element to the array.
  const ownText = element.textContent;
  if (ownText) {
    const minText = debloat(ownText);
    if (minText) {
      texts.push(minText.slice(0, 100));
    }
  }
  // Add any ID of the element to the array.
  const id = element.id;
  if (id) {
    texts.push(`#${id}`);
  }
  // Identify a concatenation of the texts.
  let textChain = texts.join('; ');
  // If it is empty:
  if (! textChain) {
    // Substitute the HTML of the element.
    textChain = `{${debloat(element.outerHTML)}}`;
    if (textChain === '{}') {
      textChain = '';
    }
  }
  // Return a concatenation of the texts in the array.
  return textChain;
}, elementHandle);
