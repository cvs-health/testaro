/*
  textNodes
  This test reports data about specified text nodes.
  Meanings of detailLevel values:
    0. Only total node count; no detail.
    1-3. Count of ancestry levels to provide data on (1 = text node, 2 = also parent,
      3 = also grandparent)
*/
exports.reporter = async (page, detailLevel, text) => {
  let data = {};
  // Get the data on the text nodes.
  try {
    data = await page.evaluate(args => {
      const detailLevel = args[0];
      const text = args[1];
      const matchNodes = [];
      // Make a copy of the body.
      const tempBody = document.body.cloneNode(true);
      // Collapse any adjacent text nodes in the copy.
      tempBody.normalize();
      // Insert it into the document.
      document.body.appendChild(tempBody);
      // Remove the irrelevant text content from the copy.
      const extraElements = Array.from(tempBody.querySelectorAll('style, script, svg'));
      extraElements.forEach(element => {
        element.textContent = '';
      });
      // FUNCTION DEFINITIONS START
      // Compacts a string.
      const compact = string => string.replace(/\s+/g, ' ').trim();
      // Compacts and lower-cases a string.
      const standardize = string => compact(string).toLowerCase();
      /*
        Gets data (tagName, text if specified, attributes, refLabels, labels, and children)
        on an element.
      */
      const getElementData = (element, withText) => {
        // Initialize the data.
        const data = {
          tagName: element.tagName
        };
        if (! ['STYLE', 'SCRIPT', 'SVG', 'svg'].includes(element.tagName)) {
          if (withText) {
            data.text = compact(element.textContent);
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
      const stdText = standardize(text);
      // Create a collection of the text nodes.
      const walker = document.createTreeWalker(tempBody, NodeFilter.SHOW_TEXT);
      // Get their count.
      const data = {nodeCount: 0};
      let more = true;
      while(more) {
        if (walker.nextNode()) {
          if (standardize(walker.currentNode.nodeValue).includes(stdText)) {
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
        // For each text node matching any specified text:
        matchNodes.forEach(node => {
          // Initialize the data on it.
          const itemData = {text: compact(node.nodeValue)};
          // If ancestral itemization is required:
          if (detailLevel > 1) {
            // Add the ancestral data, starting with the parent, to the item data.
            itemData.ancestors = [];
            let base = node;
            let currentLevel = 1;
            // For each specified ancestral distance:
            while(currentLevel++ < detailLevel) {
              // Add data on it to the data on the text node.
              const newBase = base.parentElement;
              // Omit the text of the text node if the ancestor is its parent.
              itemData.ancestors.push(getElementData(newBase, currentLevel > 2));
              base = newBase;
            }
          }
          // Add the node data to the itemization.
          data.items.push(itemData);
        });
      }
      document.body.removeChild(tempBody);
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
