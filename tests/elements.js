/*
  elements
  This test reports data about the specified elements.
*/
exports.reporter = async (page, detailLevel, tagName, onlyVisible, attribute) => {
  let selector = tagName;
  if (attribute) {
    selector += `[${attribute}]`;
  }
  if (onlyVisible) {
    selector += ':visible';
  }
  const data = page.$$eval(selector, (elements, detailLevel) => {
    const getSibInfo = (more, nodeType, nodeValue) => {
      const sibInfo = {
        type: nodeType
      };
      if (nodeType === 1) {
        sibInfo.tagName = more.tagName;
      }
      else if (nodeType === 3) {
        sibInfo.text = nodeValue;
      }
      return sibInfo;
    };
    const data = {
      total: elements.length
    };
    if (detailLevel === 0) {
      return data;
    }
    else if (detailLevel) {
      data.items = [];
      elements.forEach(element => {
        const datum = {
          tagName: element.tagName,
          code: element.outerHTML,
          attributes: [],
          textContent: element.textContent
        };
        for (const attribute of element.attributes) {
          const {name, value} = attribute;
          datum.attributes.push({
            name,
            value
          });
          if (name === 'aria-labelledby') {
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
        const {labels, textContent} = element;
        if (textContent) {
          datum.textContent = textContent;
        }
        if (labels && labels.length) {
          datum.labels = labels.map(label => label.textContent);
        }
        if (detailLevel === 2) {
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
  return {result: data};
};
