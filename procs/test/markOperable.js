// Marks elements that can be operated. See README.md for notes.
exports.markOperable = async page => {

  // ### CONSTANTS

  // Operable tag names.
  const opTags = new Set(['A', 'BUTTON', 'INPUT', 'OPTION', 'SELECT', 'TEXTAREA']);

  // ### FUNCTIONS

  // Marks an element as operable.
  const mark = async (page, [element, why]) => {
    await page.evaluate(element => {
      if (! element.dataset.autotestOperable) {
        element.setAttribute('data-autotest-operable', why);
      }
    }, [element, why]);
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
        await mark(page, [firstElement, 'tag']);
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
      // Determine whether it needs to be marked because of its cursor.
      const isMarkable = await page.evaluate(element => {
        // If it is already marked, no.
        if (element.dataset.autotestOperable) {
          return false;
        }
        // Otherwise, i.e. if it is not marked yet:
        else {
          // If its parent has a pointer cursor, undo that.
          const parent = element.parentElement;
          if (window.getComputedStyle(parent).cursor === 'pointer') {
            parent.style.cursor = 'none';
          }
          // If the element cursor is a non-inherited pointer, yes; if not, no.
          return window.getComputedStyle(element).cursor == 'pointer';
        }
      }, firstElement);
      // If so:
      if (isMarkable) {
        // Mark it as operable.
        await mark(page, [firstElement, 'cursor']);
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
      // Determine whether it needs to be marked because of an onclick property.
      const isMarkable = await page.evaluate(
        element => ! element.dataset.autotestOperable && element.hasAttribute('onclick'),
        firstElement
      );
      // If so:
      if (isMarkable) {
        // Mark it as operable.
        await mark(page, [firstElement, 'onclick']);
      }
      // Process the remaining elements.
      await onclickOperable(page, elements.slice(1));
    }
  };
  // Recursively filters elements for visibility.
  const visiblesOf = async (elements, visibles) => {
    if (elements.length) {
      const isVisible = await elements[0].isVisible();
      if (isVisible) {
        visibles.push(elements[0]);
      }
      await visiblesOf(elements.slice(1), visibles);
    }

  };

  // ### OPERATION

  // Identify the elements in the body.
  const allElements = await page.$$('body *');
  // Identify those that are visible.
  const elements = [];
  await visiblesOf(allElements, elements);
  // Recursively mark elements with operable tag names as operable.
  await tagOperable(page, elements);
  // Recursively mark elements with pointer cursor styles as operable.
  await cursorOperable(page, elements);
  // Recursively mark elements with onclick properties as operable.
  await onclickOperable(page, elements);
};
