/*
  autocomplete
  This test reports failures to equip name and email inputs with correct autocomplete attributes.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');
// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (
  page,
  withItems,
  givenLabels = ['first name', 'forename', 'given name'],
  familyLabels = ['last name', 'surname', 'family name'],
  emailLabels = ['email']
) => {
  // Initialize the locators and result.
  const all = await init(page, 'input[type=text], input[type=email], input:not([type])');
  // For each locator:
  const autoValues = {
    'given-name': givenLabels,
    'family-name': familyLabels,
    'email': emailLabels
  };
  for (const loc of all.allLocs) {
    // Get which autocomplete value, if any, its element needs.
    const elData = await getLocatorData(loc);
    const lcText = elData.excerpt.toLowerCase();
    const neededAutos = Object.keys(autoValues)
    .filter(autoValue => autoValues[autoValue].some(typeLabel => lcText.includes(typeLabel)));
    let neededAuto;
    if (neededAutos.length === 1) {
      neededAuto = neededAutos[0];
    }
    else if (! neededAutos.length && await loc.getAttribute('type') === 'email') {
      neededAuto = 'email';
    }
    // If it needs one:
    if (neededAuto) {
      // If it does not have the one it needs:
      const actualAuto = await loc.getAttribute('autocomplete');
      const isBad = actualAuto !== neededAuto;
      if (isBad) {
        // Add the locator to the array of violators.
        all.locs.push([loc, neededAuto]);
      }
    }
  }
  // Populate and return the result.
  const whats = [
    'Input is missing an autocomplete attribute with value __param__',
    'Inputs are missing applicable autocomplete attributes'
  ];
  return await report(withItems, all, 'autocomplete', whats, 2);
};
