/*
  role
  This test reports role assignment that violate either an applicable standard or an applicable
  recommendation from WAI-ARIA. Invalid roles include those that are abstract and thus prohibited
  from direct use, and those that are implicit in HTML elements and thus advised against. The math
  role has been removed, because of poor adoption and exclusion from HTML5. The img role has
  accessibility uses, so is not classified as deprecated. See:
    https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Role_Img
    https://www.w3.org/TR/html-aria/
    https://www.w3.org/TR/wai-aria/#roles_categorization
*/
exports.reporter = async page => await page.$eval('body', body => {
  // CONSTANTS
  const badRoles = new Set([
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
  // All non-abstract roles
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
  // Implicit roles
  const implicitRoles = {
    article: 'article',
    aside: 'complementary',
    button: 'button',
    datalist: 'listbox',
    dd: 'definition',
    details: 'group',
    dfn: 'term',
    dialog: 'dialog',
    dt: 'term',
    fieldset: 'group',
    figure: 'figure',
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    hr: 'separator',
    html: 'document',
    li: 'listitem',
    main: 'main',
    math: 'math',
    menu: 'list',
    nav: 'navigation',
    ol: 'list',
    output: 'status',
    progress: 'progressbar',
    summary: 'button',
    SVG: 'graphics-document',
    table: 'table',
    tbody: 'rowgroup',
    textarea: 'textbox',
    tfoot: 'rowgroup',
    thead: 'rowgroup',
    tr: 'row',
    ul: 'list'
  };
  // FUNCTIONS
  const dataInit = (data, tagName, role) => {
    if (! data.tagNames[tagName]) {
      data.tagNames[tagName] = {};
    }
    if (! data.tagNames[tagName][role]) {
      data.tagNames[tagName][role] = {
        bad: 0,
        redundant: 0
      };
    }
  };
  // OPERATION
  // Remove the deprecated roles from the non-abstract roles.
  goodRoles.forEach(role => {
    if (badRoles.has(role)) {
      goodRoles.delete(role);
    }
  });
  // Identify all elements with role attributes.
  const roleElements = Array.from(body.querySelectorAll('[role]'));
  // Initialize the result.
  const data = {
    roleElements: roleElements.length,
    badRoleElements: 0,
    redundantRoleElements: 0,
    tagNames: {}
  };
  // Identify the elements with redundant roles and bad roles.
  roleElements.forEach(element => {
    const role = element.getAttribute('role');
    const tagName = element.tagName;
    // If the role is not absolutely valid:
    if (! goodRoles.has(role)) {
      // If it is bad or redundant:
      if (badRoles.has(role)) {
        dataInit(data, tagName, role);
        // Add the facts to the result.
        if (role === implicitRoles[tagName.toLowerCase()]) {
          data.redundantRoleElements++;
          data.tagNames[tagName][role].redundant++;
        }
        else {
          data.badRoleElements++;
          data.tagNames[tagName][role].bad++;
        }
      }
      // Otherwise, i.e. if it is absolutely invalid:
      else {
        // Add the facts to the result.
        data.badRoleElements++;
        dataInit(data, tagName, role);
        data.tagNames[tagName][role].bad++;
      }
    }
  });
  // Return the result.
  return {result: data};
});
