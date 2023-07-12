/*
  Returns whether the link of a locator is inline.
  A link is classified as inline unless it is in an ordered or unordered list of at least 2 links
  with no other nonspacing text content.
*/

exports.isInlineLink = async loc => await loc.evaluate(element => {
  // Initialize the link as inline.
  let result = true;
  console.log('Initialized as inline');
  // If it is in a list item in a list of at least 2 links:
  const listAncestor = element.closest('ul, ol');
  if (listAncestor) {
    console.log('Has a list ancestor');
    if (listAncestor.children.length > 1 && Array.from(listAncestor.children).every(child => {
      const isValidListItem = child.tagName === 'LI';
      const has1Link = child.querySelectorAll('a').length === 1;
      return isValidListItem && has1Link;
    })) {
      console.log('List is pure');
      // If the list text is entirely link text:
      const listText = listAncestor.textContent.replace(/\s/g, '');
      let linkTextRaw = '';
      listAncestor.querySelectorAll('a').forEach(link => {
        linkTextRaw += link.textContent;
      });
      const linkText = linkTextRaw.replace(/\s/g, '');
      console.log(linkText);
      if (listText === linkText && listText.length) {
        console.log('No extraneous text, so non-inline');
        // Reclassify the link as non-inline.
        result = false;
      }
    }
  }
  // Return the result.
  return result;
});
