/*
  textNodes
  This test reports data about specified text nodes.
  Meanings of detailLevel values:
    0. Only total node count; no detail.
    1+. Count of ancestry levels to provide data on (1 = text node, 2 = also parent, etc.)
*/
exports.reporter = async (page, detailLevel, text) => {
  let data = {};
  // Get the data on the text nodes.
  try {
    data = await page.evaluate(args => {
      const detailLevel = args[0];
      const text = args[1];
      const matchNodes = [];
      // Normalize the body.
      document.body.normalize();
      // FUNCTION DEFINITIONS START
      // Compacts a string.
      const compact = string => string.replace(/\s+/g, ' ').trim();
      // Compacts and lower-cases a string.
      const normalize = string => compact(string).toLowerCase();
      // Gets data on an element.
      const getElementData = (element, withText) => {
        // Initialize the data.
        const data = {
          tagName: element.tagName
        };
        if (! ['SCRIPT', 'SVG', 'svg'].includes(element.tagName)) {
          if (withText) {
            data.text = element.textContent;
          }
          // Add data on its attributes, if any, to the data.
          const {attributes} = element;
          if (attributes) {
            data.attributes = [];
            for (const attribute of attributes) {
              const {name, value} = attribute;
              data.attributes.push({
                name,
                value
              });
              // If any attribute is a labeler reference:
              if (name === 'aria-labelledby') {
                // Add the label texts to the data.
                const labelerIDs = value.split(/\s+/);
                data.refLabels = [];
                labelerIDs.forEach(id => {
                  const labeler = document.getElementById(id);
                  if (labeler) {
                    data.refLabels.push(compact(labeler.textContent));
                  }
                });
              }
            }
          }
          // Add data on its labels, if any, to the data.
          const {labels} = element;
          if (labels && labels.length) {
            data.labels = Array.from(labels).map(label => compact(label.textContent));
          }
          // Add data on its child elements, if any, to the data.
          if (element.childElementCount) {
            const children = Array.from(element.children);
            data.children = [];
            children.forEach(child => {
              data.children.push(getElementData(child, true));
            });
          }
        }
        return data;
      };
      // FUNCTION DEFINITIONS END
      const normText = normalize(text);
      // Create a collection of the text nodes.
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      // Get their count.
      const data = {nodeCount: 0};
      let more = true;
      while(more) {
        if (walker.nextNode()) {
          if (
            normalize(walker.currentNode.nodeValue).includes(normText)
            && walker.currentNode.parentElement.tagName !== 'SCRIPT'
          ) {
            data.nodeCount++;
            matchNodes.push(walker.currentNode);
          }
        }
        else {
          more = false;
        }
      }
      // If no itemization is required:
      if (detailLevel === 0) {
        // Return the node count.
        return data;
      }
      // Otherwise, i.e. if itemization is required:
      else {
        // Initialize the item data.
        data.items = [];
        // For each text node matching the specified text:
        matchNodes.forEach(node => {
          // Initialize the data on it.
          const itemData = {text: compact(node.nodeValue)};
          // If ancestral itemization is required:
          if (detailLevel > 1) {
            // Add the ancestral data to the item data.
            itemData.ancestors = [];
            let base = node;
            let currentLevel = 1;
            while(currentLevel++ < detailLevel) {
              const newBase = base.parentElement;
              itemData.ancestors.push(getElementData(newBase, currentLevel > 2));
              base = newBase;
            }
          }
          // Add the node data to the itemization.
          data.items.push(itemData);
        });
      }
      return data;
    }, [detailLevel, text]);
  }
  catch(error) {
    console.log(`ERROR performing test (${error.message.replace(/\n.+/s, '')})`);
    data = {
      prevented: true,
      error: 'ERROR performing test'
    };
  }
  // Return the result.
  return {result: data};
};
