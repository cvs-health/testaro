// Reports on the outline and the text of the active element.
exports.focusedData = async (page, groupFirst) => page.evaluate(groupFirst => {
  // Initialize the result.
  const result = {};
  // Identify the focused element.
  const focused = document.activeElement;
  // If it is a focusable element in the page:
  if (focused && focused !== document.body) {
    // If in-group navigation is taking place:
    if (groupFirst) {
      // If navigation has not yet returned to the
    }
    if (focused !== groupFirst) {

    }
  }
}, groupFirst);
    const outlineWidth = window.getComputedStyle(focused).outlineWidth;
    if (outlineWidth !== '0px') {
      return [true, 1, 1];
    }
    else {
      return [true, 1, 0];
    }
  }
  else {
    return [false, 0, 0];
  }
});
focusInDoc = verdict[0];
focusables += verdict[1];
outlined += verdict[2];
