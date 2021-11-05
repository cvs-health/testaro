/*
  radioSet
  This test reports nonstandard grouping of radio buttons. It defines standard grouping
  to require that two or more radio buttons with the same name, and no other radio
  buttons, be grouped in a 'fieldset' element with a valid 'legend' element.
*/
const fs = require('fs/promises');
// Tabulates and lists radio buttons in and not in accessible field sets.
exports.reporter = async (page, withItems) => {
  // Initialize the argument array to be passed to the page function.
  const args = [withItems];
  // If itemization is required:
  if (withItems) {
    // Add the body of the textOf function as a string to the array.
    const textOfBody = await fs.readFile('procs/test/textOf.txt', 'utf8');
    args.push(textOfBody);
  }
  // Get the result data.
  const dataJSHandle = await page.evaluateHandle(args => {
    const withItems = args[0];
    // FUNCTION DEFINITIONS START
    /*
      If itemization is required, define the textOf function to get element texts.
      The function body is read as a string and passed to this method because
      a string can be passed in but a function cannot.
    */
    const textOf = args[1] ? new Function('element', args[1]) : '';
    // Trim excess spaces from a string.
    const debloat = text => text.trim().replace(/\s+/g, ' ');
    // FUNCTION DEFINITIONS END
    // Initialize a report.
    const data = {
      totals: {
        total: 0,
        inSet: 0,
        percent: 0
      }
    };
    if (withItems) {
      data.items = {
        inSet: [],
        notInSet: []
      };
    }
    // Get an array of all fieldset elements.
    const fieldsets = Array.from(document.body.querySelectorAll('fieldset'));
    // Get an array of those with valid legends.
    const legendSets = fieldsets.filter(fieldset => {
      const firstChild = fieldset.firstElementChild;
      return firstChild
      && firstChild.tagName === 'LEGEND'
      && debloat(firstChild.textContent).length;
    });
    // Get an array of the radio buttons in those with homogeneous radio buttons.
    const setRadios = legendSets.reduce((radios, currentSet) => {
      const currentRadios = Array.from(currentSet.querySelectorAll('input[type=radio]'));
      const radioCount = currentRadios.length;
      if (radioCount == 1) {
        radios.push(currentRadios[0]);
      }
      else if (radioCount > 1) {
        const radioName = currentRadios[0].name;
        if (radioName && currentRadios.slice(1).every(radio => radio.name === radioName)) {
          radios.push(...currentRadios);
        }
      }
      return radios;
    }, []);
    // Get an array of all radio buttons.
    const allRadios = Array.from(document.body.querySelectorAll('input[type=radio'));
    // Tabulate the results.
    const totals = data.totals;
    totals.total = allRadios.length;
    totals.inSet = setRadios.length;
    totals.percent = totals.total ? Math.floor(100 * totals.inSet / totals.total) : 'N.A.';
    // If itemization is required:
    if (withItems) {
      // Add it to the results.
      const nonSetRadios = allRadios.filter(radio => ! setRadios.includes(radio));
      const items = data.items;
      items.inSet = setRadios.map(radio => textOf(radio));
      items.notInSet = nonSetRadios.map(radio => textOf(radio));
    }
    return {result: data};
  }, args);
  return await dataJSHandle.jsonValue();
};
