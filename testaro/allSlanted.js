/*
  allSlanted
  Related to Tenon rule 154.
  This test reports normalized text nodes containing at least one substring of italic or
  oblique characters at least 40 characters long. Blocks of slanted text are difficult
  to read.
*/

// ########## IMPORTS

// Module to get text nodes.
const {getTextNodes} = require('../procs/getTextNodes');

// ########## FUNCTIONS

// Runs the test and returns the results.
exports.reporter = async (page, withItems) => {
  // Get the text nodes of the page and their parent elements.
  const textNodesData = await getTextNodes(page);
  // Get data on the qualifying text nodes.
  const result = await textNodesData.evaluate((textNodesData, withItems) => {
    // Initialize the result.
    const result = {
      data: {},
      totals: [0, 0, 0, 0],
      standardInstances: []
    };
    // For each text node:
    for (const textNodeData of textNodesData) {
      // If it qualifies:
      let isSlanted = false;
      if (/.{40}/.test(textNodeData[0])) {
        const styleDec = window.getComputedStyle(textNodeData[1]);
        if (['italic', 'oblique'].includes(styleDec.fontStyle)) {
          isSlanted = true;
        }
      }
      if (isSlanted) {
        // Add to the totals.
        result.totals[0]++;
        // If itemization is required:
        if (withItems) {
          // Add a standard instance.
          const {id} = textNodeData[1];
          let spec;
          if (id) {
            spec = `#${id}`;
          }
          else {
            const domRect = textNodeData[1].getBoundingClientRect();
            spec = {
              x: Math.round(domRect.x),
              y: Math.round(domRect.y),
              width: Math.round(domRect.width),
              height: Math.round(domRect.height)
            };
          }
          result.standardInstances.push({
            ruleID: 'allSlanted',
            what: 'Text is entirely italic or oblique',
            ordinalSeverity: 0,
            tagName: textNodeData[1].tagName,
            id: id || '',
            location: {
              doc: 'dom',
              type: id ? 'selector' : 'box',
              spec
            },
            excerpt: textNodeData[0]
          });
        }
      }
    }
    return result;
  }, withItems);
  if (! withItems) {
    result.standardInstances.push({
      ruleID: 'allSlanted',
      what: 'Texts are entirely italic or oblique',
      ordinalSeverity: 0,
      count: result.totals[0],
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
  return result;
};
