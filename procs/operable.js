/*
  © 2023 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  operable
  Returns whether the element of a locator is operable., i.e. it has a non-inherited pointer cursor
  and is not a 'LABEL' element, has an operable tag name, has an interactive explicit role, or has
  an 'onclick' attribute. The isOperable function modifies the page.
*/

// ########## FUNCTIONS

// Gets whether an element is operable.
exports.isOperable = async loc => {
  // Get whether and, if so, how the element is operable.
  const operabilities = await loc.evaluate(el => {
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
    // Initialize the operabilities.
    const opHow = [];
    // If the element is not a label and has a non-inherited pointer cursor:
    let hasPointer = false;
    if (el.tagName !== 'LABEL') {
      const styleDec = window.getComputedStyle(el);
      hasPointer = styleDec.cursor === 'pointer';
      if (hasPointer) {
        el.parentElement.style.cursor = 'default';
        hasPointer = styleDec.cursor === 'pointer';
      }
    }
    if (hasPointer) {
      // Add this to the operabilities.
      opHow.push('pointer cursor');
    }
    // If the element is clickable:
    if (el.onclick) {
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
