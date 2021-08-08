// Returns an object classifying the links in a page by layout.
exports.linksByType = async page => await page.evaluateHandle(() => {
  // FUNCTION DEFINITIONS START
  // Returns whether an element has fluid display.
  const hasFluidDisplay = element => {
    const display = window.getComputedStyle(element).display;
    return display.startsWith('inline') || display.startsWith('flex');
  };
  // Returns whether and element and its children have fluid display.
  const isFluid = element => {
    if (hasFluidDisplay(element)) {
      return hasFluidDisplay(Array.from(element.children));
    }
    else {
      return false;
    }
  };
  // Removes spacing characters from a text.
  const despace = text => text.replace(/\s/g, '');
  // Returns whether the nearest ancestor block has more text than an element.
  const hasAdjacentText = element => {
    // Recursively returns the first ancestor element with non-fluid display.
    const blockOf = node => {
      const parentElement = node.parentElement;
      if (hasFluidDisplay(parentElement)) {
        return blockOf(parentElement);
      }
      else {
        return parentElement;
      }
    };
    const elementText = despace(element.textContent);
    if (elementText) {
      return despace(blockOf(element).textContent).length > elementText.length;
    }
    else {
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
