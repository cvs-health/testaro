// Returns counts, fractions, and texts of inline links, by whether underlined.
exports.linkUl = async (page, withItems) => await page.$eval('body', (body, withItems) => {
  // FUNCTION DEFINITIONS START
  // Returns whether all child elements of an element have inline display.
  const isInline = element => {
    const children = Array.from(element.children);
    return children.every(child => window.getComputedStyle(child).display.startsWith('inline'));
  };
  // Removes spacing characters from a text.
  const despace = text => text.replace(/\s/g, '');
  // Returns whether one element has more text than another and both have real text.
  const hasMoreText = element => {
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
  // Returns a space-minimized copy of a string.
  const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
  // FUNCTION DEFINITIONS END
  // Identify all links.
  const links = Array.from(body.getElementsByTagName('a'));
  // Identify those with less text than their nearest non-inline ancestors as inline.
  const inLinks = links.filter(link => isInline(link) && hasMoreText(link));
  let underlined = 0;
  const ulInLinkTexts = [];
  const nulInLinkTexts = [];
  // For each of them:
  inLinks.forEach(link => {
    // Identify the text of the link if itemization is required.
    const text = withItems ? compact(link.textContent) : '';
    // If it is underlined:
    if (window.getComputedStyle(link).textDecorationLine === 'underline') {
      // Increment the count of underlined inline links.
      underlined++;
      // If required, add its text to the array of their texts.
      if (withItems) {
        ulInLinkTexts.push(text);
      }
    }
    // Otherwise, if it is not underlined and itemization is required:
    else if (withItems) {
      // Add its text to the array of texts of non-underlined inline links.
      nulInLinkTexts.push(text);
    }
  });
  // Get the percentage of underlined links among all inline links.
  const ulPercent = inLinks.length
    ? Math.floor(100 * ulInLinkTexts.length / inLinks.length)
    : 'N/A';
  const data = {
    linkCount: links.length,
    inLinkCount: inLinks.length,
    underlined,
    ulPercent
  };
  if (withItems) {
    data.ulInLinkTexts = ulInLinkTexts;
    data.nulInLinkTexts = nulInLinkTexts;
  }
  return data;
}, withItems);
