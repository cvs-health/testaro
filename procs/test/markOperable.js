// Marks elements that can be operated. See README.md for notes.
exports.markOperable = async page => {
  // Identify visible elements and other elements marked focusable.
  await page.$$eval('body :visible, body [data-autotest-focused]', elements => {
    // If there are any:
    if (elements.length) {
      let styleDec;
      const opTags = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);
      // For each of them:
      elements.forEach(element => {
        // If it has an operable tag name and has no menu-item parent, mark it.
        if (
          opTags.has(element.tagName) && element.parentElement.getAttribute('role') !== 'menuitem'
        ) {
          element.dataset.autotestOperable = 'tag';
        }
        // Otherwise, if it is a menu-item parent of an element with an operable tag name, mark it.
        else if (
          element.getAttribute('role') === 'menuitem'
          && opTags.has(element.firstElementChild.tagName)
        ) {
          element.dataset.autotestOperable = 'menuitem';
        }
        // Otherwise, if it has an onclick attribute, mark it.
        else if (element.hasAttribute('onclick')) {
          element.dataset.autotestOperable = 'onclick';
        }
        // Otherwise, if it has a pointer cursor:
        else if ((styleDec = window.getComputedStyle(element)).cursor == 'pointer') {
          // If its parent element has one, unset it.
          const parent = element.parentElement;
          if (parent && window.getComputedStyle(parent).cursor === 'pointer') {
            parent.style.cursor = 'none';
          }
          // If the element still has a (therefore non-inherited) pointer cursor, mark it.
          if (styleDec.cursor == 'pointer') {
            element.dataset.autotestOperable = 'cursor';
          }
        }
      });
    }
  });
};
