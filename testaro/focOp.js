/*
  focOp

  WARNING: The chromium and firefox browsers in Playwright make errors on this test by
  misclassifying the cursor property values of the computed styles of elements. Launch the
  webkit browser to run this test.

  This test reports descrepancies between Tab-focusability and operability. The standard
  practice is to make focusable elements operable and vice versa. If focusable elements are not
  operable, users are likely to be surprised that nothing happens when they try to operate such
  elements. If operable elements are not focusable, users depending on keyboard navigation are
  prevented from operating those elements. The test considers an element operable if it has a
  non-inherited pointer cursor and is not a 'LABEL' element, has an operable tag name ('A',
  'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA'), has an interactive explicit role (button,
  link, checkbox, switch, input, textbox, searchbox, combobox, option, treeitem, radio, slider,
  spinbutton, menuitem, menuitemcheckbox, composite, grid, select, listbox, menu, menubar, tree,
  tablist, tab, gridcell, radiogroup, treegrid, widget, or scrollbar), or has an 'onclick'
  attribute. The test considers an element Tab-focusable if its tabIndex property has the value 0.
*/
exports.reporter = async (page, withItems) => {
  // Get data on focusability-operability-discrepant elements.
  const data = await page.$$eval('body *', (elements, withItems) => {
    // Initialize the data.
    const data = {
      totals: {
        total: 0,
        types: {
          onlyFocusable: {
            total: 0,
            tagNames: {}
          },
          onlyOperable: {
            total: 0,
            tagNames: {}
          }
        }
      }
    };
    if (withItems) {
      data.items = {
        onlyFocusable: [],
        onlyOperable: []
      };
    }
    // FUNCTION DEFINITIONS START
    // Returns data on an element’s operability and prevents it from propagating a pointer.
    const operabilityOf = element => {
      // Identify the operable tag names.
      const opTags = new Set(['A', 'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA']);
      // Identify the operable roles.
      const opRoles = new Set([
        'button',
        'checkbox',
        'combobox',
        'composite',
        'grid',
        'gridcell',
        'input',
        'link',
        'listbox',
        'menu',
        'menubar',
        'menuitem',
        'menuitemcheckbox',
        'option',
        'radio',
        'radiogroup',
        'scrollbar',
        'searchbox',
        'select',
        'slider',
        'spinbutton',
        'switch',
        'tab',
        'tablist',
        'textbox',
        'tree',
        'treegrid',
        'treeitem',
        'widget',
      ]);
      // Identify whether the element has a pointer cursor.
      const hasPointer = window.getComputedStyle(element).cursor === 'pointer';
      // Identify the bases for considering an element operable.
      const opBases = [
        opTags.has(element.tagName),
        element.hasAttribute('onclick'),
        opRoles.has(element.getAttribute('role')),
        hasPointer && element.tagName !== 'LABEL'
      ];
      // If the element is operable:
      const result = {operable: opBases.some(basis => basis)};
      if (result.operable) {
        // Add its data to its result.
        result.byTag = opBases[0];
        result.byOnClick = opBases[1];
        result.byPointer = opBases[2];
      }
      // If the cursor is a pointer:
      if (hasPointer) {
        // Change it to the browser default to prevent pointer propagation.
        element.style.cursor = 'default';
      }
      // Return the result.
      return result;
    };
    // Adds facts about an element to data.
    const addFacts = (element, status, byTag, byOnClick, byPointer) => {
      const statusNames = {
        f: 'onlyFocusable',
        o: 'onlyOperable'
      };
      const statusName = statusNames[status];
      data.totals.types[statusName].total++;
      const tagNames = data.totals.types[statusName].tagNames;
      const {id, tagName} = element;
      tagNames[tagName] = (tagNames[tagName] || 0) + 1;
      if (withItems) {
        const elementData = {
          tagName: element.tagName,
          id: id || '',
          text: (element.textContent.trim() || element.outerHTML.trim())
          .replace(/\s{2,}/sg, ' ')
          .slice(0, 100)
        };
        if (status !== 'f') {
          elementData.byTag = byTag;
          elementData.byOnClick = byOnClick;
          elementData.byPointer = byPointer;
        }
        data.items[statusName].push(elementData);
      }
    };
    // FUNCTION DEFINITIONS END
    // For each element:
    elements.forEach(element => {
      // If its tab index is 0, deem it focusable and:
      if (element.tabIndex === 0) {
        // Determine whether and how it is operable.
        const {operable} = operabilityOf(element);
        // If it is not:
        if (! operable) {
          // Increment the total.
          data.totals.total++;
          // Add its data to the result.
          addFacts(element, 'f');
        }
      }
      // Otherwise, i.e. if it is not focusable:
      else {
        // Determine whether and how it is operable.
        const {operable, byTag, byOnClick, byPointer} = operabilityOf(element);
        // If it is:
        if (operable) {
          // Increment the total.
          data.totals.total++;
          // Add its data to the result.
          addFacts(element, 'o', byTag, byOnClick, byPointer);
        }
      }
    });
    return data;
  }, withItems)
  .catch(error => {
    console.log(`ERROR getting focOp data (${error.message})`);
    data.prevented = true;
  });
  // Derive the standard data.
  const totals = [0, 0, 0, 0];
  if (
    data.totals
    && data.totals.types
    && data.totals.types.onlyFocusable
    && data.totals.types.onlyOperable
    && typeof data.totals.types.onlyFocusable.total === 'number'
    && typeof data.totals.types.onlyOperable.total === 'number'
  ) {
    totals[2] = data.totals.types.onlyFocusable.total;
    totals[3] = data.totals.types.onlyOperable.total;
  }
  const standardInstances = [];
  if (data.items && data.items.onlyFocusable && data.items.onlyOperable) {
    ['onlyFocusable', 'onlyOperable'].forEach(issue => {
      const gripe = issue === 'onlyFocusable'
        ? 'is focusable but not operable'
        : 'is operable but not focusable';
      const ordinalSeverity = issue === 'onlyFocusable' ? 2 : 3;
      data.items[issue].forEach(item => {
        standardInstances.push({
          ruleID: 'focOp',
          complaint: `${item.tagName || 'An'} element ${gripe}`,
          ordinalSeverity,
          tagName: item.tagName,
          id: item.id,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item.text
        });
      });
    });
  }
  else {
    if (totals[2]) {
      standardInstances.push({
        ruleID: 'focOp',
        complaint: 'Focusable elements are inoperable',
        count: totals[2],
        ordinalSeverity: 2,
        tagName: '',
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
    if (totals[3]) {
      standardInstances.push({
        ruleID: 'focOp',
        complaint: 'Operable elements are nonfocusable',
        count: totals[3],
        ordinalSeverity: 3,
        tagName: '',
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
  }
  // Reload the page.
  try {
    await page.reload({timeout: 15000});
  }
  catch(error) {
    console.log('ERROR: page reload timed out');
  }
  return {
    data,
    totals,
    standardInstances
  };
};
