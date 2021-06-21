// Marks elements that can be operated. See README.md for notes.
exports.markOperable = async page => {

  // ### CONSTANTS

  // Operable tag names.
  const opTags = new Set(['A', 'BUTTON', 'INPUT', 'OPTION', 'SELECT', 'TEXTAREA']);

  // ### FUNCTIONS

  // Marks an element as operable.
  const mark = async (page, element) => {
    await page.evaluate(element => {
      if (! element.dataset.autotestOperable) {
        element.setAttribute('data-autotest-operable', 1);
      }
    }, element);
  };
  // Recursively finds and marks the elements that have operable tag names.
  const tagOperable = async (page, elements) => {
    // If any elements remain unprocessed:
    if (elements.length) {
      // Identify the first of them.
      const firstElement = elements[0];
      // Get its tag name.
      const tagNameJSHandle = await firstElement.getProperty('tagName');
      const tagName = await tagNameJSHandle.jsonValue();
      // If the tag name is inherently operable:
      if (opTags.has(tagName)) {
        // Mark the element as operable.
        await mark(page, firstElement);
      }
      // Process the remaining elements.
      await tagOperable(page, elements.slice(1));
    }
  };
  // Recursively finds and marks the elements that have pointer-cursor styles.
  const cursorOperable = async (page, elements) => {
    // If any elements remain unprocessed:
    if (elements.length) {
      // Identify the first of them.
      const firstElement = elements[0];
      // Identify its cursor style.
      const cursor = await page.evaluate(
        element => window.getComputedStyle(element).cursor, firstElement
      );
      // If it is a pointer:
      if (cursor === 'pointer') {
        // Mark the element as operable.
        await mark(page, firstElement);
      }
      // Process the remaining elements.
      await cursorOperable(page, elements.slice(1));
    }
  };
  // Recursively finds and marks the elements that have onclick properties.
  const onclickOperable = async (page, elements) => {
    // If any elements remain unprocessed:
    if (elements.length) {
      // Identify the first of them.
      const firstElement = elements[0];
      // Get its onclick property, or null if none.
      const onclick = await firstElement.getAttribute('onclick');
      // If it exists:
      if (onclick) {
        // Mark the element as operable.
        await mark(page, firstElement);
      }
      // Process the remaining elements.
      await onclickOperable(page, elements.slice(1));
    }
  };
  /*
  // Recursively (and probably erroneously) finds and marks the elements that are clickable.
  const clickOperable = async (page, elements) => {
    // If any elements remain unprocessed:
    if (elements.length) {
      // Identify the first of them.
      const firstElement = elements[0];
      // If clicking it initiates no navigation:
      try {
        await firstElement.click({
          timeout: 37,
          trial: false
        });
        // Do nothing.
        '';
      }
      // Otherwise, i.e. if clicking it initiates navigation:
      catch {
        // Mark it as operable.
        await mark(page, firstElement);
      }
      // Process the remaining elements.
      await clickOperable(page, elements.slice(1));
    }
  };
  */

  // ### OPERATION

  // Identify the elements in the body.
  const elements = await page.$$('body *');
  // Recursively mark elements with operable tag names as operable.
  await tagOperable(page, elements);
  // Recursively mark elements with pointer cursor styles as operable.
  await cursorOperable(page, elements);
  // Recursively mark elements with onclick properties as operable.
  await onclickOperable(page, elements);
  // Return the result.
  return 1;
};
