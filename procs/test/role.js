// Returns counts, fractions, and texts of inline links, by whether underlined.
exports.role = async page => await page.$eval('body', body => {
  // CONSTANTS
  // Deprecated roles (from https://www.w3.org/TR/html-aria/).
  const badRoles = new Set([
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
  ]);
  // All non-abstract roles (from https://www.w3.org/TR/wai-aria/#roles_categorization).
  const goodRoles = new Set([
    'alert',
    'alertdialog',
    'application',
    'article',
    'banner',
    'button',
    'cell',
    'checkbox',
    'columnheader',
    'combobox',
    'complementary',
    'contentinfo',
    'definition',
    'dialog',
    'directory',
    'document',
    'feed',
    'figure',
    'form',
    'grid',
    'gridcell',
    'group',
    'heading',
    'img',
    'link',
    'list',
    'listbox',
    'listitem',
    'log',
    'main',
    'marquee',
    'math',
    'menu',
    'menubar',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'navigation',
    'none',
    'note',
    'option',
    'presentation',
    'progressbar',
    'radio',
    'radiogroup',
    'region',
    'row',
    'rowgroup',
    'rowheader',
    'scrollbar',
    'search',
    'searchbox',
    'separator',
    'separator',
    'slider',
    'spinbutton',
    'status',
    'switch',
    'tab',
    'table',
    'tablist',
    'tabpanel',
    'term',
    'textbox',
    'timer',
    'toolbar',
    'tooltip',
    'tree',
    'treegrid',
    'treeitem',
  ]);
  // Remove the deprecated roles from the non-abstract roles.
  goodRoles.forEach(role => {
    if (badRoles.has(role)) {
      goodRoles.delete(role);
    }
  });
  // Identify all elements with role attributes.
  const roleElements = Array.from(body.querySelectorAll('[role]'));
  // Identify those with roles that are either deprecated or invalid.
  const bads = roleElements.filter(element => {
    const role = element.role;
    return badRoles.has(role) || ! goodRoles.has(role);
  });
  // Initialize the result.
  const data = {
    roleElements: roleElements.length,
    badRoleElements: bads.length,
    tagNames: {}
  };
  // For each element with a deprecated role:
  bads.forEach(element => {
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
      data.tagNames[tagName] = {[role]: 1};
    }
  });
  return data;
});
