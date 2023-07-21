/*
  motion
  This test reports motion in a page. For minimal accessibility, standards require motion to be
  brief, or else stoppable by the user. But stopping motion can be difficult or impossible, and,
  by the time a user manages to stop motion, the motion may have caused annoyance or harm. For
  superior accessibility, a page contains no motion until and unless the user authorizes it. The
  test compares two screen shots of the viewport 2 seconds and 6 seconds after page load. It
  reports a rule violation if more than 1% of the pixels change. The larger the change fraction,
  the greater the ordinal severity.
  
  WARNING: This test uses the Playwright page.screenshot method, which produces incorrect results
  when the browser type is chromium and is not implemented for the firefox browser type. The only
  browser type usable with this test is webkit.
*/

// IMPORTS

const {visChange} = require('../procs/visChange');

// FUNCTIONS

// Reports motion in a page.
exports.reporter = async page => {
  // Initialize the totals and standard instances.
  const totals = [0, 0, 0, 0];
  const standardInstances = [];
  // Make screenshots and get the result.
  const data = await visChange(page, {
    delayBefore: 2000,
    delayBetween: 3000
  });
  // If the screenshots succeeded:
  if (data.success) {
    // Get the ordinal severity from the fractional pixel change.
    const ordinalSeverity = Math.floor(Math.min(3, 0.4 * Math.sqrt(data.changePercent)));
    // If any pixels were changed:
    if (data.pixelChanges) {
      // Add to the totals.
      totals[ordinalSeverity] = 1;
      // Get a summary standard instance.
      standardInstances.push({
        ruleID: 'motion',
        what: 'Content moves or changes without user request',
        count: 1,
        ordinalSeverity,
        tagName: 'HTML',
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
  // Return the result.
  return {
    data,
    totals,
    standardInstances
  };
};
