// Returns data about the element identified by a locator.
exports.getLocatorData = async loc => {
  // Get the facts obtainable from the browser.
  const data = await loc.evaluate(element => {
    // Tag name.
    const tagName = element.tagName;
    // ID.
    const id = element.id || '';
    // Texts.
    const {textContent} = element;
    const alts = Array.from(element.querySelectorAll('img[alt]:not([alt=""])'));
    const altTexts = alts.map(alt => alt.getAttribute('alt'));
    const altsText = altTexts.join(' ');
    const ariaLabelText = element.ariaLabel || '';
    const refLabelID = element.getAttribute('aria-labelledby');
    const refLabel = refLabelID ? document.getElementById(refLabelID) : '';
    const refLabelText = refLabel ? refLabel.textContent : '';
    let labelsText = '';
    if (tagName === 'INPUT') {
      const labels = element.labels;
      const labelTexts = [];
      labels.forEach(label => {
        labelTexts.push(label.textContent);
      });
      labelsText = labelTexts.join(' ');
    }
    let text = [textContent, altsText, ariaLabelText, refLabelText, labelsText]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
    if (! text) {
      text = element.outerHTML.replace(/\s+/g, ' ').trim();
    }
    // Location.
    let location = {
      doc: 'dom',
      type: 'box',
      spec: {}
    };
    if (id) {
      location.type = 'selector';
      location.spec = `#${id}`;
    }
    // Return the data.
    return {
      tagName,
      id,
      location,
      excerpt: text
    };
  });
  // If an ID-based selector could not be defined:
  if (data.location.type === 'box') {
    // Define a bounding-box-based location.
    data.location.spec = await loc.boundingBox();
  }
  // If the text is long:
  if (data.excerpt.length > 400) {
    // Truncate its middle.
    data.excerpt = `${data.excerpt.slice(0, 200)} … ${data.excerpt.slice(-200)}`;
  }
  // Return the data.
  return data;
};
