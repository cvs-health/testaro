// Marks elements that can be operated.
exports.markOperable = async page => {

  // ### CONSTANTS

  // Operable tag names.
  const opTags = ['A', 'BUTTON', 'INPUT', 'OPTION', 'SELECT', 'TEXTAREA'];

  // ### FUNCTIONS

  // Mark an element as operable.
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
      if (opTags.includes(tagName)) {
        // Mark the element as operable.
        await mark(page, firstElement);
      }
      // Process the remaining elements.
      await tagOperable(page, elements.slice(1));
    }
  };

  // Recursively finds and marks the elements that are clickable.
  const clickOperable = async (page, elements) => {
    // If any elements remain unprocessed:
    if (elements.length) {
      // Identify the first of them.
      const firstElement = elements[0];
      // If it is clickable:
      try {
        await firstElement.click({
          timeout: 100,
          trial: true
        });
        // Mark it as operable.
        await mark(page, firstElement);
      }
      // Otherwise, i.e. if it is not clickable, do nothing.
      catch {
        '';
      }
      // Process the remaining elements.
      await clickOperable(page, elements.slice(1));
    }
  };

  // ### OPERATION

  // Identify the elements in the body.
  const elements = await page.$$('body *');
  // Recursively mark elements with operable tag names as operable.
  await tagOperable(page, elements);
  // Recursively mark clickable elements as operable.
  await clickOperable(page, elements);
  // Return the result.
  return 1;
};
