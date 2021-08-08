// Returns an object classifying the links in a page by layout.
exports.linksByType = async page => await page.evaluateHandle(() => {
  // FUNCTION DEFINITIONS START
  // Returns whether an element has fluid display.
  const hasFluidDisplay = element => {
    const display = window.getComputedStyle(element).display;
    return display.startsWith('inline') || display.startsWith('flex');
  };
  // Returns whether an element and its children have fluid display.
  const isFluid = element => {
    if (hasFluidDisplay(element)) {
      return Array.from(element.children).every(child => hasFluidDisplay(child));
    }
    else {
      return false;
    }
  };
  // Removes spacing characters from a text.
  const despace = text => text.replace(/\s/g, '');
  // Returns whether an element has text that is less than its nearest nonfluid ancestor’s.
  const hasAdjacentText = element => {
    // Recursively returns the first ancestor element with nonfluid display.
    const blockOf = node => {
      const parentElement = node.parentElement;
      if (hasFluidDisplay(parentElement)) {
        return blockOf(parentElement);
      }
      else {
        return parentElement;
      }
    };
    // Identify the text of the element.
    const elementText = despace(element.textContent);
    // Identify the text of its nearest nonfluid ancestor.
    const blockText = despace(blockOf(element).textContent);
    // If the element has any text:
    if (elementText) {
      // Return whether it is less than its nearest nonfluid ancestor’s.
      return despace(blockText).length > elementText.length;
    }
    // Otherwise, i.e. if the element has no text:
    else {
      // Return no.
      return false;
    }
  };
  // FUNCTION DEFINITIONS END
  // Get the links in the page.
  const links = Array.from(document.body.getElementsByTagName('a'));
  // Initialize an object classifying the links.
  const linkTypes = {
    inline: [],
    block: []
  };
  // Populate it.
  links.forEach(link => {
    if (isFluid(link) && hasAdjacentText(link)) {
      linkTypes.inline.push(link);
    }
    else {
      linkTypes.block.push(link);
    }
  });
  // Return it.
  return linkTypes;
});
