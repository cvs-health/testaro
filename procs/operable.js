/*
  operable

  Returns whether the element of a locator is operable., i.e. it has a non-inherited pointer cursor
  and is not a 'LABEL' element, has an operable tag name, has an interactive explicit role, or has
  an 'onclick' attribute.
*/

// ########## CONSTANTS

// Operable tag names.
const opTags = new Set(['A', 'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA']);
// Operable roles.
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

// ########## FUNCTIONS

// Gets whether an element is operable.
exports.isOperable = async loc => {
  // Get whether and, if so, how the element is operable.
  const operabilities = await loc.evaluate(el => {
    // Initialize the operabilities.
    const opHow = [];
    // If the element is not a label and has a non-inherited pointer cursor:
    let hasPointer = false;
    if (el.tagName !== 'LABEL') {
      const styleDec = window.getComputedStyle(el);
      hasPointer = styleDec.cursor === 'pointer';
      if (hasPointer) {
        element.parentElement.style.cursor = 'default';
        hasPointer = styleDec.cursor === 'pointer';
      }
    }
    if (hasPointer) {
      // Add this to the operabilities.
      opHow.push('pointer cursor');
    }
    // If the element is clickable:
    if (el.onClick) {
      // Add this to the operabilities.
      opHow.push('click listener');
    }
    // If the element has an operable explicit role:
    const role = el.getAttribute('role');
    if (opRoles.has(role)) {
      // Add this to the operabilities.
      opHow.push(`role ${role}`);
    }
    // If the element has an operable type:
    const tagName = el.tagName;
    if (opTags.has(tagName)) {
      // Add this to the operabilities.
      opHow.push(`tag name ${tagName}`);
    }
    return opHow;
  });
  return operabilities;
};
