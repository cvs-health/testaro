/*
  hover
  This test reports unexpected impacts of hovering.

  The elements that are subjected to hovering (called “triggers”) are the elements that have
  aria-controls, aria-expanded, onmouseenter, or onmouseover' attributes.

  Despite the delay, the test can make the execution time practical by randomly sampling triggers
  instead of hovering over all of them. When sampling is performed, the results may vary from one
  execution to another. Because hover impacts typically occur near the beginning of a page with
  navigation menus, the probability of the inclusion of a trigger in a sample decreases with the
  index of the trigger.

  Pixel changes: If no pixel changes occur immediately after an element is hovered over, the page
  is examined once more, after 0.5 second. The greater the fraction of changed pixels, the greater
  the ordinal severity.

  Unhoverability: An element is reported as unhoverable when it fails the Playwright actionability
  checks for hovering, i.e. fails to be attached to the DOM, visible, stable (not or no longer
  animating), and able to receive events. All triggers satisfy the first two conditions, so only the
  last two might fail. Playwright defines the ability to receive events as being the target of an
  action on the location where the center of the element is, rather than some other element with a
  higher zIndex value in the same location being the target.

  WARNING: This test uses the procs/visChange module. See the warning in that module about browser
  types.
*/

// ########## IMPORTS

// Module to perform common operations.
const {init, report} = require('../procs/testaro');

// ########## FUNCTIONS

// Runs the test and returns the result.
exports.reporter = async (page, withItems) => {
  // Initialize the locators and result.
  const all = await init(
    page, 'body [aria-controls], body [aria-expanded], body [onmouseenter], body [onmouseover]'
  );
  const miscAll = await init(page, 'body *');
  all.allLocs.push(... miscAll.allLocs);
  // For each locator:
  for (const loc of all.allLocs) {
    // Get whether its element violates the rule.
    const additions = await loc.evaluate(el => {
      const mouseout = new Event('mouseout');
      el.dispatchEvent(mouseout);
      const elementCount0 = document.body.querySelectorAll('*').length;
      const mouseenter = new Event('mouseenter');
      el.dispatchEvent(mouseenter);
      const mouseover = new Event('mouseover');
      el.dispatchEvent(mouseover);
      const elementCount1 = document.body.querySelectorAll('*').length;
      const additions = elementCount1 - elementCount0;
      return additions;
    });
    // If it does:
    if (additions !== 0) {
      // Add the locator and the change of element count to the array of violators.
      const impact = additions > 0
        ? `added ${additions} elements to the page`
        : `subtracted ${- additions} from the page`;
      all.locs.push([loc, impact]);
    }
  }
  // Populate and return the result.
  const whats = [
    'Hovering over the element __impact__',
    'Hovering over elements adds elements to or subtracts elements from the page'
  ];
  return await report(withItems, all, 'ruleID', whats, 0);
};
