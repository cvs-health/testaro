/*
  elements
  This test reports data about specified elements.
*/
exports.reporter = async (page, detailLevel, tagName, onlyVisible, attribute) => {
  // Determine a selector of the specified elements.
  let selector = tagName;
  if (attribute) {
    selector += `[${attribute}]`;
  }
  if (onlyVisible) {
    selector += ':visible';
  }
  // Get the data on the elements.
  const data = page.$$eval(selector, (elements, detailLevel) => {
    // FUNCTION DEFINITION START
    // Gets data on the sibling nodes of an element.
    const getSibInfo = (element, nodeType, nodeValue) => {
      const sibInfo = {
        type: nodeType
      };
      if (nodeType === 1) {
        sibInfo.tagName = element.tagName;
      }
      else if (nodeType === 3) {
        sibInfo.text = nodeValue;
      }
      return sibInfo;
    };
    // FUNCTION DEFINITION END
    // Initialize the data with the count of the specified elements.
    const data = {
      total: elements.length
    };
    // If no itemization is required:
    if (detailLevel === 0) {
      // Return the element count.
      return data;
    }
    // Otherwise, i.e. if itemization is required:
    else {
      // Initialize the item data.
      data.items = [];
      // For each specified element:
      elements.forEach(element => {
        // Initialize data on it.
        const datum = {
          tagName: element.tagName,
          code: element.outerHTML,
          attributes: [],
          textContent: element.textContent
        };
        // For each of its attributes:
        for (const attribute of element.attributes) {
          // Add data on the attribute to the element data.
          const {name, value} = attribute;
          datum.attributes.push({
            name,
            value
          });
          // If the element has reference labels:
          if (name === 'aria-labelledby') {
            // Add their texts to the element data.
            const labelerIDs = document.getElementById(value).split(/\s/);
            const labelers = [];
            labelerIDs.forEach(id => {
              const labeler = document.getElementById(id);
              if (labeler) {
                labelers.push(labeler.textContent);
              }
            });
            if (labelers.length) {
              datum.labelers = labelers;
            }
          }
        }
        // If the element has text content:
        const {labels, textContent} = element;
        if (textContent) {
          // Add it to the element data.
          datum.textContent = textContent;
        }
        // If the element has labels:
        if (labels && labels.length) {
          // Add their texts to the element data.
          datum.labels = labels.map(label => label.textContent);
        }
        // If sibling itemization is required:
        if (detailLevel === 2) {
          // Add the sibling data to the element data.
          datum.siblings = {
            before: [],
            after: []
          };
          let more = true;
          while (more) {
            const more = element.previousSibling;
            const {nodeType, nodeValue} = more;
            if (more && ! (nodeType === 3 && nodeValue === '')) {
              const sibInfo = getSibInfo(more, nodeType, nodeValue);
              datum.siblings.before.unshift(sibInfo);
            }
          }
          more = true;
          while (more) {
            const more = element.nextSibling;
            const {nodeType, nodeValue} = more;
            if (more && ! (nodeType === 3 && nodeValue === '')) {
              const sibInfo = getSibInfo(more, nodeType, nodeValue);
              datum.siblings.after.push(sibInfo);
            }
          }
        }
      });
    }
  }, detailLevel);
  // Return the result.
  return {result: data};
};
