/*
  hover
  This test reports unexpected impacts of hovering. The elements that are subjected to hovering
  (called “triggers”) include all the elements that have ARIA attributes associated with control
  over the visibility of other elements and all the elements that have onmouseenter or
  onmouseover attributes, as well as a sample of all visible elements in the body. If hovering over
  an element results in an increase or decrease in the total count of visible elements in the body,
  the rule is considered violated.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const allTrigger = await init(
    page, '[aria-controls], [aria-expanded], [aria-haspopup], [onmouseenter], [onmouseover]'
  );
  const allNonTrigger = await init(
    page,
    'body *:not([aria-controls], [aria-expanded], [aria-haspopup], [onmouseenter], [onmouseover])'
  );
  const populationSize
    = allTrigger.result.data.populationSize + allNonTrigger.result.data.populationSize;
  const sampleSize = allTrigger.result.data.sampleSize + allNonTrigger.result.data.sampleSize;
  const all = {
    allLocs: allTrigger.allLocs.concat(allNonTrigger.allLocs),
    locs: [],
    result: {
      data: {
        populationSize,
        sampleSize,
        populationRatio: sampleSize ? populationSize / sampleSize : null
      },
      totals: [0, 0, 0, 0],
      standardInstances: []
    }
  };
  // For each locator:
  for (const loc of all.allLocs) {
    // Get how many elements are added or subtracted when the element is hovered over.
    await page.mouse.move(0, 0);
    const loc0 = page.locator('body *:visible');
    const elementCount0 = await loc0.count();
    try {
      await loc.hover({
        force: true,
        timeout: 100
      });
      const loc1 = page.locator('body *:visible');
      const elementCount1 = await loc1.count();
      const additions = elementCount1 - elementCount0;
      // If any elements are:
      if (additions !== 0) {
        // Add the locator and the change of element count to the array of violators.
        const impact = additions > 0
          ? `added ${additions} elements to the page`
          : `subtracted ${- additions} from the page`;
        all.locs.push([loc, impact]);
      }
    }
    catch(error) {
      console.log(`Hovering timed out (${error.message.replace(/[\n].+/s, '')})`);
    }
  }
  // Populate and return the result.
  const whats = [
    'Hovering over the element __param__',
    'Hovering over elements adds elements to or subtracts elements from the page'
  ];
  // Reload the page.
  try {
    await page.reload({timeout: 15000});
  }
  catch(error) {
    console.log('ERROR: page reload timed out');
  }
  return await report(withItems, all, 'hover', whats, 0);
};
