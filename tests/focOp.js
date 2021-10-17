// Reports focusable elements that are not operable and vice versa.
// Returns counts, and texts if required, of focusable elements with and without indicators.
exports.reporter = async (page, withItems, revealAll) => {
  // If required, make all elements visible.
  if (revealAll) {
    await require('../procs/test/allVis').allVis(page);
  }
  // Get data on focusability-operability-discrepant elements.
  const data = await page.$$eval('body *:visible', (elements, withItems) => {
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
    // FUNCTION DEFINITION START
    const operabilityOf = element => {
      const opTags = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);
      const opBases = [
        opTags.has(element.tagName),
        element.hasAttribute('onclick'),
        window.getComputedStyle(element).cursor === 'pointer' && element.tagName !== 'LABEL'
      ];
      const result = {
        operable: opBases.reduce((isOperable, currentBasis) => isOperable || currentBasis, false)
      };
      if (result.operable) {
        result.byTag = opBases[0];
        result.byOnClick = opBases[1];
        result.byPointer = opBases[2];
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
        const operability = operabilityOf(element);
        const {operable, byTag, byOnClick, byPointer} = operability;
        // If it is:
        if (operable) {
          // Add its data to the result.
          data.totals.focusableAndOperable++;
          if (withItems) {
            data.items.focusableAndOperable.push({
              tagName: element.tagName,
              byTag,
              byOnClick,
              byPointer
            });
          }
        }
        // Otherwise, i.e. if it is not operable:
        else {
          // Add its data to the result.
          data.totals.onlyFocusable++;
          if (withItems) {
            data.items.onlyFocusable.push({
              tagName: element.tagName,
            });
          }
        }
      }
      // Otherwise, i.e. if it is not focusable:
      else {
        // Determine whether and how it is operable.
        const operability = operabilityOf(element);
        const {operable, byTag, byOnClick, byPointer} = operability;
        // If it is:
        if (operable) {
          // Add its data to the result.
          data.totals.onlyOperable++;
          if (withItems) {
            data.items.onlyOperable.push({
              tagName: element.tagName,
              byTag,
              byOnClick,
              byPointer
            });
          }
        }
      }
    });
    return data;
  }, withItems);
  return {result: data};
};
