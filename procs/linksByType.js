// Returns an object classifying the links in a page by layout.
exports.linksByType = async page => await page.evaluateHandle(() => {
  // FUNCTION DEFINITIONS START
  // Removes spacing characters from a text.
  const despace = text => text.replace(/\s/g, '');
  // Returns whether a list is a list entirely of links.
  const isLinkList = list => {
    const listItems = Array.from(list.children);
    if (listItems.length > 1) {
      return listItems.length > 1 && listItems.every(item => {
        if (item.tagName === 'LI') {
          const {children} = item;
          if (children.length === 1) {
            const link = children[0];
            if (link.tagName === 'A') {
              const itemText = despace(item.textContent);
              const linkText = despace(link.textContent);
              return itemText.length === linkText.length;
            }
            else {
              return false;
            }
          }
          else {
            return false;
          }
        }
        else {
          return false;
        }
      });
    }
    else {
      return false;
    }
  };
  // FUNCTION DEFINITIONS END
  // Identify the list links in the page.
  const lists = Array.from(document.body.querySelectorAll('ul, ol'));
  const listLinks = [];
  lists.forEach(list => {
    if (isLinkList(list)) {
      listLinks.push(... Array.from(list.querySelectorAll('a')));
    }
  });
  // Identify the adjacent links in the page.
  const allLinks = Array.from(document.body.querySelectorAll('a'));
  const adjacentLinks = allLinks.filter(link => ! listLinks.includes(link));
  // Return the data.
  return {
    adjacent: adjacentLinks,
    list: listLinks
  };
});
