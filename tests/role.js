/*
  role
  This set reports nonstandard role attributes.

  It assumes that a role attribute is nonstandard in either of three cases:

    0. It assigns a non-existent role.
    1. It assigns an abstract role.
    2. It assigns a role that is implicit in a native HTML element.

  The WAI-ARIA standard forbids the assignment of abstract roles and recommends against the
  assignment of HTML-implicit roles.
*/
exports.reporter = async page => await page.$eval('body', body => {
  // CONSTANTS
  /*
    The math role has been removed, because of poor adoption and exclusion from HTML5.
    The img role has accessibility uses
    (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Role_Img),
    so is not classified as deprecated.
    Deprecated roles (from https://www.w3.org/TR/html-aria/).
  */
  const badRoles = new Set([
    'article',
    'button',
    'cell',
    'checkbox',
    'columnheader',
    'combobox',
    'complementary',
    'contentinfo',
    'definition',
    'dialog',
    'document',
    'figure',
    'graphics-document',
    'gridcell',
    'group',
    'heading',
    'link',
    'list',
    'listbox',
    'listitem',
    'main',
    'navigation',
    'option',
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
    const role = element.getAttribute('role');
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
    const role = element.getAttribute('role');
    // Add them to the result.
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
  return {result: data};
});
