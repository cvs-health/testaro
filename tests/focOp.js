// Reports focusable elements that are not operable and vice versa.
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
          .slice(0, 80)
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
  }, withItems);
  return {result: data};
};
