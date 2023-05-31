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
  non-inherited pointer cursor and is not a 'LABEL' element, or has an operable tag name ('A',
  'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA'), or has an 'onclick' attribute. The test
  considers an element Tab-focusable if its tabIndex property has the value 0.
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
          },
          focusableAndOperable: {
            total: 0,
            tagNames: {}
          }
        }
      }
    };
    if (withItems) {
      data.items = {
        onlyFocusable: [],
        onlyOperable: [],
        focusableAndOperable: []
      };
    }
    // FUNCTION DEFINITIONS START
    // Returns data on an element’s operability and prevents it from propagating a pointer.
    const operabilityOf = element => {
      const opTags = new Set(['A', 'BUTTON', 'IFRAME', 'INPUT', 'SELECT', 'TEXTAREA']);
      const hasPointer = window.getComputedStyle(element).cursor === 'pointer';
      const opBases = [
        opTags.has(element.tagName),
        element.hasAttribute('onclick'),
        hasPointer && element.tagName !== 'LABEL'
      ];
      const result = {operable: opBases.some(basis => basis)};
      if (result.operable) {
        result.byTag = opBases[0];
        result.byOnClick = opBases[1];
        result.byPointer = opBases[2];
      }
      // If the cursor is a pointer:
      if (hasPointer) {
        // Change it to the browser default to prevent pointer propagation.
        element.style.cursor = 'default';
      }
      return result;
    };
    // Adds facts about an element to data.
    const addFacts = (element, status, byTag, byOnClick, byPointer) => {
      const statusNames = {
        f: 'onlyFocusable',
        o: 'onlyOperable',
        b: 'focusableAndOperable'
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
        // Increment the grand total.
        data.totals.total++;
        // Determine whether and how it is operable.
        const {operable, byTag, byOnClick, byPointer} = operabilityOf(element);
        // If it is:
        if (operable) {
          // Add its data to the result.
          addFacts(element, 'b', byTag, byOnClick, byPointer);
        }
        // Otherwise, i.e. if it is not operable:
        else {
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
          // Increment the grand total.
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
      const issueID = issue === 'onlyFocusable'
        ? 'focOp-focusable-inoperable'
        : 'focOp-operable-nonfocusable';
      const gripe = issue === 'onlyFocusable'
        ? 'is focusable but not operable'
        : 'is operable but not focusable';
      const ordinalSeverity = issue === 'onlyFocusable' ? 2 : 3;
      data.items[issue].forEach(item => {
        const itemID = item.id ? ` (ID ${item.id})` : '';
        const which = `${item.tagName}${itemID}`;
        standardInstances.push({
          issueID,
          what: `Element ${which} ${gripe}`,
          ordinalSeverity,
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
  else if (totals[2] || totals[3]) {
    standardInstances.push({
      issueID: 'focOp',
      what: 'Focusable elements are inoperable or vice versa',
      ordinalSeverity: totals[3] ? 3 : 2,
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
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
