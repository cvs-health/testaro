/*
  © 2021–2024 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  role
  This test reports role assignments that violate either an applicable standard or an applicable
  recommendation from WAI-ARIA. Invalid roles include those that are abstract and thus prohibited
  from direct use, and those that are implicit in HTML elements and thus advised against. Roles
  that explicitly confirm implicit roles are deemed redundant and can be scored as less serious
  than roles that override implicit roles. The math role has been removed, because of poor
  adoption and exclusion from HTML5. The img role has accessibility uses, so is not classified
  as deprecated. See:
    https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Role_Img
    https://www.w3.org/TR/html-aria/
    https://www.w3.org/TR/wai-aria/#roles_categorization
*/
exports.reporter = async page => await page.evaluate(() => {

  // CONSTANTS

  // All roles implicit in HTML elements.
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
  // All non-abstract roles.
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
  const implicitAttributes = {
    a: [
      {
        role: 'link',
        attributes: {
          href: /./
        }
      }
    ],
    area: [
      {
        role: 'link',
        attributes: {
          href: /./
        }
      }
    ],
    h1: [
      {
        role: 'heading',
        attributes: {
          'aria-level': /^1$/
        }
      }
    ],
    h2: [
      {
        role: 'heading',
        attributes: {
          'aria-level': /^2$/
        }
      },
      {
        role: 'heading',
        attributes: {
          'aria-level': false
        }
      }
    ],
    h3: [
      {
        role: 'heading',
        attributes: {
          'aria-level': /^3$/
        }
      }
    ],
    h4: [
      {
        role: 'heading',
        attributes: {
          'aria-level': /^4$/
        }
      }
    ],
    h5: [
      {
        role: 'heading',
        attributes: {
          'aria-level': /^5$/
        }
      }
    ],
    h6: [
      {
        role: 'heading',
        attributes: {
          'aria-level': /^6$/
        }
      }
    ],
    input: [
      {
        role: 'checkbox',
        attributes: {
          type: /^checkbox$/
        }
      },
      {
        role: 'button',
        attributes: {
          type: /^(?:button|image|reset|submit)$/
        }
      },
      {
        role: 'combobox',
        attributes: {
          type: /^(?:email|search|tel|text|url)$/,
          list: true
        }
      },
      {
        role: 'combobox',
        attributes: {
          type: false,
          list: true
        }
      },
      {
        role: 'radio',
        attributes: {
          type: /^radio$/
        }
      },
      {
        role: 'searchbox',
        attributes: {
          type: /^search$/,
          list: false
        }
      },
      {
        role: 'slider',
        attributes: {
          type: /^range$/
        }
      },
      {
        role: 'spinbutton',
        attributes: {
          type: /^number$/
        }
      },
      {
        role: 'textbox',
        attributes: {
          type: /^(?:email|tel|text|url)$/,
          list: false
        }
      },
      {
        role: 'textbox',
        attributes: {
          type: false,
          list: false
        }
      },
      {
        role: 'checkbox',
        attributes: {
          type: /^checkbox$/
        }
      },
      {
        role: 'checkbox',
        attributes: {
          type: /^checkbox$/
        }
      },
    ],
    img: [
      {
        role: 'presentation',
        attributes: {
          alt: /^$/
        }
      },
      {
        role: 'img',
        attributes: {
          alt: /./
        }
      },
      {
        role: 'img',
        attributes: {
          alt: false
        }
      }
    ],
    select: [
      {
        role: 'listbox',
        attributes: {
          multiple: true
        }
      },
      {
        role: 'listbox',
        attributes: {
          size: /^(?:[2-9]|[1-9]\d+)$/
        }
      },
      {
        role: 'combobox',
        attributes: {
          multiple: false,
          size: false
        }
      },
      {
        role: 'combobox',
        attributes: {
          multiple: false,
          size: /^1$/
        }
      }
    ]
  };
  // Array of th and td elements with redundant roles.
  const redundantCells = [];
  const {body} = document;
  // Elements with role attributes.
  const roleElements = Array.from(body.querySelectorAll('[role]'));
  // th and td elements with redundant roles.
  const gridHeaders = Array.from(
    body.querySelectorAll('table[role=grid] th, table[role=treegrid] th')
  );
  const gridCells = Array.from(
    body.querySelectorAll('table[role=grid] td, table[role=treegrid] td')
  );
  const tableHeaders = Array.from(
    body.querySelectorAll('table[role=table] th, table:not([role]) th')
  );
  const tableCells = Array.from(
    body.querySelectorAll('table[role=table] td, table:not([role]) td')
  );
  // Initialized result summrary.
  const data = {
    roleElements: roleElements.length,
    badRoleElements: 0,
    redundantRoleElements: 0,
    tagNames: {}
  };

  // FUNCTIONS

  // Initializes the result summary.
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
  // Adds table-element data to the result summary.
  const tallyTableRedundancy = (elements, redundantRoles, tagName) => {
    elements.forEach(element => {
      const role = element.getAttribute('role');
      if (redundantRoles.includes(role)) {
        dataInit(data, tagName, role);
        data.redundantRoleElements++;
        data.tagNames[tagName][role].redundant++;
        redundantCells.push(element);
      }
    });
  };

  // OPERATION

  // Get the good (non-abstract, non-element-implicit) roles.
  goodRoles.forEach(role => {
    if (badRoles.has(role)) {
      goodRoles.delete(role);
    }
  });
  // Identify the table elements with redundant roles.
  tallyTableRedundancy(gridHeaders, ['columnheader', 'rowheader', 'gridcell'], 'TH');
  tallyTableRedundancy(gridCells, ['gridcell'], 'TD');
  tallyTableRedundancy(tableHeaders, ['columnheader', 'rowheader', 'cell'], 'TH');
  tallyTableRedundancy(tableCells, ['cell'], 'TD');
  // Identify the additional elements with redundant roles and bad roles.
  roleElements.filter(element => ! redundantCells.includes(element)).forEach(element => {
    const role = element.getAttribute('role');
    const tagName = element.tagName;
    // If the role is not absolutely valid:
    if (! goodRoles.has(role)) {
      // If it is bad or redundant:
      if (badRoles.has(role)) {
        dataInit(data, tagName, role);
        const lcTagName = tagName.toLowerCase();
        // If it is simply redundant:
        if (role === implicitRoles[lcTagName]) {
          // Update the result summary.
          data.redundantRoleElements++;
          data.tagNames[tagName][role].redundant++;
        }
        // Otherwise, if it is attributionally redundant:
        else if (
          implicitAttributes[lcTagName] && implicitAttributes[lcTagName].some(
            criterion => role === criterion.role && Object.keys(criterion.attributes).every(
              attributeName => {
                const rule = criterion.attributes[attributeName];
                const exists = element.hasAttribute(attributeName);
                const value = exists ? element.getAttribute(attributeName) : null;
                if (rule === true) {
                  return exists;
                }
                else if (rule === false) {
                  return ! exists;
                }
                else {
                  return rule.test(value);
                }
              }
            )
          )
        ) {
          // Update the results.
          data.redundantRoleElements++;
          data.tagNames[tagName][role].redundant++;
        }
        // Otherwise, i.e. if it is absolutely invalid:
        else {
          // Update the results.
          data.badRoleElements++;
          data.tagNames[tagName][role].bad++;
        }
      }
      // Otherwise, i.e. if it is absolutely invalid:
      else {
        // Update the results.
        data.badRoleElements++;
        dataInit(data, tagName, role);
        data.tagNames[tagName][role].bad++;
      }
    }
  });
  const standardInstances = [];
  Object.keys(data.tagNames).forEach(tagName => {
    Object.keys(data.tagNames[tagName]).forEach(role => {
      const pairTotals = data.tagNames[tagName][role];
      const redCount = pairTotals.redundant;
      if (redCount) {
        standardInstances.push({
          ruleID: 'role',
          what: `Elements have redundant explicit role ${role}`,
          count: redCount,
          ordinalSeverity: 1,
          tagName,
          id: '',
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: ''
        });
      }
      const badCount = pairTotals.bad;
      if (badCount) {
        standardInstances.push({
          ruleID: 'role',
          what:
          `Elements have invalid or native-replaceable explicit role ${role}`,
          count: badCount,
          ordinalSeverity: 3,
          tagName,
          id: '',
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: ''
        });
      }
    });
  });
  // Return the result.
  return {
    data,
    totals: [0, data.redundantRoleElements, 0, data.badRoleElements],
    standardInstances
  };
});
