/*
  focOp
  Related to Tenon rule 190.

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
  // Get data on the discrepancies.
  const focOpData = await page.evaluate(() => {
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
    // Initialize an array of data on the elements.
    const allElements = Array.from(document.querySelectorAll('body *'));
    // Return an array of facts about them. For each element:
    return allElements.map(el => {
      // Get whether its cursor is deemed a pointer.
      let hasPointer = false;
      if (el.tagName !== 'LABEL') {
        const styleDec = window.getComputedStyle(el);
        hasPointer = styleDec.cursor === 'pointer';
        // If the cursor is a pointer:
        if (hasPointer) {
          // Disregard this if the only reason is inheritance.
          el.parentElement.style.cursor = 'default';
          hasPointer = styleDec.cursor === 'pointer';
        }
      }
      // Get whether it is focusable and whether it is operable.
      const tagName = el.tagName;
      const role = el.getAttribute('role') || '';
      const onClick = el.getAttribute('onclick') !== null;
      const isFocusable = el.tabIndex === 0;
      const isOperable = hasPointer
      || opTags.has(tagName)
      || onClick
      || opRoles.has(role);
      // If it is focusable or operable but not both:
      if (isFocusable !== isOperable) {
        let opTagName, opRole;
        if (isOperable) {
          opTagName = opTags.has(tagName) ? tagName : '';
          const role = el.getAttribute('role');
          opRole = opRoles.has(role) ? role : '';
        }
        // Add data on the element to the array.
        return {
          role,
          onClick,
          isFocusable,
          isOperable,
          opTagName,
          opRole
        };
      }
      // Otherwise, i.e. if it is not discrepant:
      else {
        // Add this to the array.
        return false;
      }
    });
  });
  // Get locators for all body descendants.
  const allLoc = await page.locator('body *');
  const allLocs = await allLoc.all();
  // Get arrays of discrepant locators and their data.
  const locs = allLocs.filter((loc, index) => focOpData[index]);
  const locData = focOpData.filter(item => item);
  // Initialize the standard result.
  const data = {};
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // For each discrepant element:
  locs.forEach(async (loc, index) => {
    // Get data on it.
    const elData = await getLocatorData(loc);
    const focOpData = locData[index];
    // Get its ordinal severity.
    const ordinalSeverity = focOpData.isFocusable ? 2 : 3;
    // Add to the totals.
    totals[ordinalSeverity]++;
    // If itemization is required:
    if (withItems) {
      // Get data on its operability.
      const howOperable = [];
      if (focOpData.opTagName) {
        howOperable.push(`tag name ${focOpData.opTagName}`);
      }
      if (focOpData.hasPointer) {
        howOperable.push('pointer cursor');
      }
      if (focOpData.onClick) {
        howOperable.push('click listener');
      }
      if (focOpData.opRole) {
        howOperable.push(`role ${focOpData.opRole}`);
      }
      // Get a discrepancy description.
      const gripe = focOpData.isFocusable
        ? 'Tab-focusable but not operable'
        : `operable (${howOperable.join(', ')}) but not Tab-focusable`;
      // Add a standard instance.
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
  });
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
