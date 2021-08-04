// Returns an object classifying the links in a page as inline or block.
exports.linksByType = async page => await page.evaluateHandle(() => {
  // FUNCTION DEFINITIONS START
  // Returns whether all child elements of an element have inline display.
  const isInline = element => {
    const children = Array.from(element.children);
    return children.every(child => window.getComputedStyle(child).display.startsWith('inline'));
  };
  // Removes spacing characters from a text.
  const despace = text => text.replace(/\s/g, '');
  // Returns whether the nearest block has more text than an element and both have real text.
  const hasAdjacentText = element => {
    // Recursively returns the first ancestor element with non-inline display.
    const blockOf = node => {
      const parentElement = node.parentElement;
      if (window.getComputedStyle(parentElement).display.startsWith('inline')) {
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
  const links = Array.from(document.getElementsByTagName('a'));
  // Initialize an object classifying the links.
  const linkTypes = {
    inline: [],
    block: []
  };
  // Populate it.
  links.forEach(link => {
    if (isInline(link) && hasAdjacentText(link)) {
      linkTypes.inline.push(link);
    }
    else {
      linkTypes.block.push(link);
    }
  });
  // Return it.
  return linkTypes;
});
