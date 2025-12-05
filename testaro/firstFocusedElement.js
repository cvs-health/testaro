/*
  Rule: firstFocusedElement
  Detects if the initial focused element is not the first focusable element in the DOM.
*/

exports.reporter = async (page, withItems) => {
  // Espera a que la página esté cargada
  await page.waitForLoadState('domcontentloaded');

  // Obtiene el elemento inicialmente enfocado
  const initialFocused = await page.evaluate(() => {
    return document.activeElement && document.activeElement.outerHTML;
  });

  // Obtiene la lista de elementos focusables en orden DOM
  const focusables = await page.evaluate(() => {
    const selector = [
      'a[href]:not([tabindex="-1"]):not([disabled])',
      'button:not([tabindex="-1"]):not([disabled])',
      'input:not([type="hidden"]):not([tabindex="-1"]):not([disabled])',
      'select:not([tabindex="-1"]):not([disabled])',
      'textarea:not([tabindex="-1"]):not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])'
    ].join(',');
    return Array.from(document.querySelectorAll(selector)).map(el => el.outerHTML);
  });

  // Compara el elemento enfocado con el primero focusable
  let count = 0;
  let details = '';
  if (focusables.length > 0 && initialFocused !== focusables[0]) {
    count = 1;
    details = `Initial focus is on: ${initialFocused}\nFirst focusable is: ${focusables[0]}`;
  }

  return {
    totals: [0, 0, count, 0],
    standardInstances: count > 0 ? [{
      ruleID: 'firstFocusedElement',
      what: 'Initial focus is not on the first focusable element',
      ordinalSeverity: 2,
      count,
      tagName: '',
      id: '',
      location: { doc: '', type: '', spec: '' },
      excerpt: details,
      boxID: '',
      pathID: ''
    }] : []
  };
};
