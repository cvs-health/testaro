/*
  Lists autocomplete-eligible input elements with their autocomplete attributes and
  accessible names.
*/
exports.reporter = async page => await page.$eval('body', body => {
  // Get an array of autocomplete-eligible inputs.
  const inputTypes = ['date', 'email', 'password', 'tel', 'text', 'url'];
  const selectors = inputTypes.map(type => `input[type=${type}]`);
  const elements = Array.from(body.querySelectorAll(selectors.join(', ')));
  // Return a result array, in which, for each input:
  const result = elements.map((el, index) => {
    // Limit the length of displayed labels.
    const labelTextMax = 100;
    // Get an array of the text contents of its label elements, if any.
    const labelTexts = Array.from(el.labels).map(label => label.textContent);
    // Add the text contents of its referenced labels, if any.
    if (el.hasAttribute('aria-labelledby')) {
      const byIDs = el.getAttribute('aria-labelledby').split(/\s+/);
      labelTexts
      .push(
        ...byIDs
        .map(id => {
          const el = document.getElementById(id);
          return el ? el.textContent : '';
        })
        .filter(text => text)
      );
    }
    // Add the value of its aria-label attribute, if any.
    if (el.hasAttribute('aria-label')) {
      labelTexts.push(el.getAttribute('aria-label'));
    }
    // Get a length-limited concatenation of the label texts.
    let labelText = labelTexts.join('; ')
    .replace(/[<>]/g, '')
    .replace(/\s{2,}/g, ' ');
    if (labelText.length > labelTextMax) {
      labelText = labelText.slice(0, labelTextMax) + '&hellip;';
    }
    // Return an object describing the input.
    return {
      index,
      type: el.type || 'text',
      autocomplete: el.getAttribute('autocomplete') || 'NONE',
      labelText
    };
  });
  return {
    result
  };
});
