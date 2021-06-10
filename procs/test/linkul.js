// Reports counts and fractions of underlined links among inline links adn lists them.
exports.linkul = async page => await page.$eval('body', body => {
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
  // Returns whether all child elements of an element have inline display.
  const isInline = element => {
    const children = Array.from(element.children);
    return children.every(child => window.getComputedStyle(child).display.startsWith('inline'));
  };
  // Removes spacing characters from a text.
  const despace = text => text.replace(/\s/g, '');
  // Returns whether one element has more text than another.
  const hasMoreText = (element0, element1) =>
    despace(element0.textContent).length > despace(element1.textContent).length;
  const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
  const links = Array.from(body.getElementsByTagName('a'));
  const inLinks = links.filter(link => isInline(link) && hasMoreText(blockOf(link), link));
  const ulInLinkTexts = [];
  const nulInLinkTexts = [];
  inLinks.forEach(link => {
    if (window.getComputedStyle(link).textDecorationLine === 'underline') {
      ulInLinkTexts.push(compact(link.textContent));
    }
    else {
      nulInLinkTexts.push(compact(link.textContent));
    }
  });
  const ulPercent = inLinks.length
    ? Math.floor(100 * ulInLinkTexts.length / inLinks.length)
    : 'N/A';
  return {
    linkCount: links.length,
    inLinkCount: inLinks.length,
    ulPercent,
    ulInLinkTexts,
    nulInLinkTexts
  };
});
