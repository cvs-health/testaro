// Returns counts, fractions, and texts of inline links, by whether underlined.
exports.role = async page => await page.$eval('body', body => {
  // CONSTANTS
  // Deprecated roles (from https://www.w3.org/TR/html-aria/).
  const badRoles = [
    'article',
    'button',
    'cell',
    'checkbox',
    'columnheader',
    'combobox',
    'complementary',
    'definition',
    'dialog',
    'document',
    'figure',
    'graphics-document',
    'gridcell',
    'group',
    'heading',
    'img',
    'link',
    'list',
    'listbox',
    'listitem',
    'main',
    'math',
    'navigation',
    'option',
    'presentation',
    'progressbar',
    'radio',
    'region',
    'row',
    'rowgroup',
    'rowheader',
    'searchbox',
    'separator',
    'slider',
    'spinbutton',
    'status',
    'table',
    'term',
    'textbox'
  ];
  // Identify all elements with role attributes.
  const roleElements = Array.from(body.querySelectorAll('[role]'));
  // Identify those with deprecated roles.
  const bads = roleElements.filter(element => badRoles.includes(element.role));
  // Initialize the result.
  const data = {
    roleElements: roleElements.length,
    badRoleElements: bads.length,
    tagNames: {}
  };
  // For each element with a deprecated role:
  badRoleElements.forEach(element => {
    // Identify its facts.
    const tagName = element.tagName;
    const role = element.role;
    // Add it to the result.
    if (data.tagNames[tagName]) {
      if (data.tagNames[tagName][role]) {
        data.tagNames[tagName][role]++;
      }
      else {
        data.tagNames[tagName][role] = 1;
      }
    }
    else {
      data.tagNames[tagName] = {[role]: 1}
    }
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
  const ulPercent = inLinkCount ? Math.floor(100 * underlined / inLinkCount) : 'N/A';
  const data = {
    linkCount: links.length,
    inLinkCount,
    underlined,
    ulPercent
  };
  if (withItems) {
    data.ulInLinkTexts = ulInLinkTexts;
    data.nulInLinkTexts = nulInLinkTexts;
  }
  return data;
}, withItems);
