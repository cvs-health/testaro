/*
  autocomplete
  This test reports failures to equip name and email inputs with correct autocomplete attributes.
*/

// ########## IMPORTS

// Returns text associated with an element.
const {allText} = require('../procs/allText');

// ########## FUNCTIONS

// Adds a failure, if any, to the data.
const addFailure = async (withItems, input, inputText, autocomplete, data) => {
  // If it does not have the required autocomplete attribute:
  const autoValue = await input.getAttribute('autocomplete');
  if (autoValue !== autocomplete) {
    // Add this to the total.
    data.total++;
    // If itemization is required:
    if (withItems) {
      // Add the item to the data.
      data.items.push([autocomplete, inputText.slice(0, 100)]);
    }
  }
};
// Reports failures.
exports.reporter = async (page, withItems) => {
  const data = {total: 0};
  if (withItems) {
    data.items = [];
  }
  // Identify the inputs.
  const inputs = await page.$$('input');
  // If there are any:
  if (inputs.length) {
    // For each one:
    for (const input of inputs) {
      const inputText = await allText(page, input);
      // If it is a text input:
      const inputType = await input.getAttribute('type');
      if (inputType === 'text' || ! inputType) {
        const inputTextLC = inputText.toLowerCase();
        // If it requests a given name:
        if (
          inputTextLC === 'first'
          || ['first name', 'given name'].some(phrase => inputTextLC.includes(phrase))
        ) {
          // Add any failure to the data.
          await addFailure(withItems, input, inputText, 'given-name', data);
        }
        // Otherwise, if it requests a family name:
        else if (
          inputTextLC === 'last'
          || ['last name', 'family name'].some(phrase => inputTextLC.includes(phrase))
        ) {
          // Add any failure to the data.
          await addFailure(withItems, input, inputText, 'family-name', data);
        }
        // Otherwise, if it requests an email address:
        else if (inputTextLC.includes('email')) {
          // Add any failure to the data.
          await addFailure(withItems, input, inputText, 'email', data);
        }
      }
      // Otherwise, if it is an email input:
      else if (inputType === 'email') {
        // Add any failure to the data.
        await addFailure(withItems, input, inputText, 'email', data);
      }
    }
  }
  const standardInstances = [];
  if (data.items) {
    data.items.forEach(item => {
      standardInstances.push({
        issueID: `autocomplete-${item[0]}`,
        what: `Input is missing the required autocomplete attribute with value ${item[0]}`,
        ordinalSeverity: 2,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item[1]
      });
    });
  }
  else if (data.total) {
    standardInstances.push({
      issueID: 'autocomplete',
      what: 'Inputs are missing required autocomplete attributes',
      ordinalSeverity: 2,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
  }
  // Return the data.
  return {
    data,
    totals: [0, 0, data.total, 0],
    standardInstances
  };
};
