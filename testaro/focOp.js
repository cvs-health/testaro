/*
  focOp
  Related to Tenon rule 190.

  WARNING: The chromium and firefox browsers in Playwright fail to accept are stricter on this test than the
  chromium browser is.
  misclassifying the tabIndex values of elements. Launch the webkit browser to run this test.

  This test reports discrepancies between Tab-focusability and operability. The standard
  practice is to make focusable elements operable and vice versa. If focusable elements are not
  operable, users are likely to be surprised that nothing happens when they try to operate such
  elements. If operable elements are not focusable, users depending on keyboard navigation are
  prevented from operating those elements. The test considers an element operable if it has a
  non-inherited pointer cursor and is not a 'LABEL' element, has an operable tag name ('A',
  'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA'), has an interactive explicit role (button,
  link, checkbox, switch, input, textbox, searchbox, combobox, option, treeitem, radio, slider,
  spinbutton, menuitem, menuitemcheckbox, composite, grid, select, listbox, menu, menubar, tree,
  tablist, tab, gridcell, radiogroup, treegrid, widget, or scrollbar), or has an 'onclick'
  attribute. The test considers an element Tab-focusable if its tabIndex property has the value 0.
*/

// ########## IMPORTS

// Module to get locator data.
const {getLocatorData} = require('../procs/getLocatorData');

// ########## FUNCTIONS

exports.reporter = async (page, withItems) => {
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Identify the operable tag names.
  const opTags = new Set(['A', 'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA']);
  // Identify the operable roles.
  const opRoles = new Set([
    'button',
    'checkbox',
    'combobox',
    'composite',
    'grid',
    'gridcell',
    'input',
    'link',
    'listbox',
    'menu',
    'menubar',
    'menuitem',
    'menuitemcheckbox',
    'option',
    'radio',
    'radiogroup',
    'scrollbar',
    'searchbox',
    'select',
    'slider',
    'spinbutton',
    'switch',
    'tab',
    'tablist',
    'textbox',
    'tree',
    'treegrid',
    'treeitem',
    'widget',
  ]);
  // Get a locator for all body elements.
  const locAll = page.locator('body *');
  const locsAll = await locAll.all();
  // For each of them:
  for (const loc of locsAll) {
    // Get data on it.
    const focOpData = await loc.evaluate(element => {
      // Tab index.
      const {tabIndex} = element;
      // Cursor.
      let hasPointer = false;
      if (element.tagName !== 'LABEL') {
        const styleDec = window.getComputedStyle(element);
        hasPointer = styleDec.cursor === 'pointer';
        // If the cursor is a pointer:
        if (hasPointer) {
          // Disregard this if the only reason is inheritance.
          element.parentElement.style.cursor = 'default';
          hasPointer = styleDec.cursor === 'pointer';
        }
      }
      const {tagName} = element;
      return {
        tabIndex,
        hasPointer,
        tagName
      };
    });
    focOpData.onClick = await loc.getAttribute('onclick') !== null;
    focOpData.role = await loc.getAttribute('role') || '';
    focOpData.isFocusable = focOpData.tabIndex === 0;
    focOpData.isOperable = focOpData.hasPointer
    || opTags.has(focOpData.tagName)
    || focOpData.onClick
    || opRoles.has(focOpData.role);
    // If it is focusable or operable but not both:
    if (focOpData.isFocusable !== focOpData.isOperable) {
      // Get more data on it.
      const elData = await getLocatorData(loc);
      // Add to the standard result.
      const howOperable = [];
      if (opTags.has(focOpData.tagName)) {
        howOperable.push(`tag name ${focOpData.tagName}`);
      }
      if (focOpData.hasPointer) {
        howOperable.push('pointer cursor');
      }
      if (focOpData.onClick) {
        howOperable.push('click listener');
      }
      if (opRoles.has(focOpData.role)) {
        howOperable.push(`role ${focOpData.role}`);
      }
      const gripe = focOpData.isFocusable
        ? 'Tab-focusable but not operable'
        : `operable (${howOperable.join(', ')}) but not Tab-focusable`;
      const ordinalSeverity = focOpData.isFocusable ? 2 : 3;
      totals[ordinalSeverity]++;
      if (withItems) {
        standardInstances.push({
          ruleID: 'focOp',
          what: `Element is ${gripe}`,
          ordinalSeverity,
          tagName: elData.tagName,
          id: elData.id,
          location: elData.location,
          excerpt: elData.excerpt
        });
      }
    }
  }
  // If itemization is not required:
  if (! withItems) {
    // Add summary instances to the standard result.
    if (totals[2]) {
      standardInstances.push({
        ruleID: 'focOp',
        what: 'Tab-focusable elements are inoperable',
        count: totals[2],
        ordinalSeverity: 2,
        tagName: '',
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
    if (totals[3]) {
      standardInstances.push({
        ruleID: 'focOp',
        what: 'Operable elements are not Tab-focusable',
        count: totals[3],
        ordinalSeverity: 3,
        tagName: '',
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
  }
  // Reload the page.
  try {
    await page.reload({timeout: 15000});
  }
  catch(error) {
    console.log('ERROR: page reload timed out');
  }
  // Return the standard result.
  return {
    data,
    totals,
    standardInstances
  };
};
