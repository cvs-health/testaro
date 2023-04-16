/*
  autocomplete
  This test reports failures to equip name and email inputs with correct autocomplete attributes.
*/

// ########## IMPORTS

// Returns text associated with an element.
const {allText} = require('../procs/allText');

// ########## FUNCTIONS

// Adds a failure, if any, to the data.
const addFailure = (input, inputText, autocomplete, data) => {
  // If it does not have the required autocomplete attribute:
  if (input.getAttribute('autocomplete') !== autocomplete) {
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
      // If it is a text input:
      const inputType = input.getAttribute('type');
      if (inputType === 'text' || ! inputType) {
        const inputText = await allText(page, input);
        const inputTextLC = inputText.toLowerCase();
        // If it requests a given name:
        if (
          inputTextLC === 'first'
          || ['first name', 'given name'].some(phrase => inputTextLC.includes(phrase))
        ) {
          // Add any failure to the data.
          addFailure(input, inputText, 'given-name', data);
        }
        // Otherwise, if it requests a family name:
        else if (
          inputTextLC === 'last'
          || ['last name', 'family name'].some(phrase => inputTextLC.includes(phrase))
        ) {
          // Add any failure to the data.
          addFailure(input, inputText, 'family-name', data);
        }
        // Otherwise, if it requests an email address:
        else if (inputTextLC.includes('email')) {
          // Add any failure to the data.
          addFailure(input, inputText, 'email', data);
        }
      }
      // Otherwise, if it an email input:
      else if (inputType === 'email') {
        // Add any failure to the data.
        addFailure(input, inputText, 'email', data);
      }
    }
  }
  // Return the data.
  return {result: data};
};
