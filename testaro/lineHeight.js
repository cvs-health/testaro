/*
  lineHeight
  Related to Tenon rule 144.
  This test reports text nodes whose line heights are less than 1.5 times their font sizes.
*/
exports.reporter = async (page, withItems) => {
  // Identify the text nodes with substandard line heights.
  const data = await page.evaluate(() => {
    // Initialize the result.
    const data = [];
    // Collapse any adjacent text nodes.
    document.body.normalize();
    // Remove the irrelevant text content.
    const extraElements = Array.from(document.body.querySelectorAll('style, script, svg'));
    extraElements.forEach(element => {
      element.textContent = '';
    });
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    // Create a collection of the text nodes.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let more = true;
    while(more) {
      if (walker.nextNode()) {
        const nodeText = walker.currentNode.nodeValue;
        const compactNodeText = compact(nodeText);
        if (compactNodeText) {
          textNodes.push(walker.currentNode);
        }
      }
      else {
        more = false;
      }
    }
    // For each of them:
    textNodes.forEach(textNode => {
      // Get the font size and line height of its parent element.
      const parentStyleDec = window.getComputedStyle(textNode.parentElement);
      const parentFontSizeText = parentStyleDec.fontSize;
      const parentLineHeightText = parentStyleDec.lineHeight;
      const parentFontSizeNum = Number.parseFloat(parentFontSizeText);
      const parentLineHeightNum = Number.parseFloat(parentLineHeightText) || 1.5 * parentFontSizeNum;
      // If the line height is substandard:
      if (parentLineHeightNum < 1.5 * parentFontSizeNum) {
        // Add data on the text node to the result.
        const parentElement = textNode.parentElement;
        let shortText = compact(textNode.nodeValue);
        if (shortText.length > 400) {
          shortText = `${shortText.slice(0, 200)} … ${shortText.slice(-200)}`;
        }
        data.push({
          tagName: parentElement.tagName,
          id: parentElement.id || '',
          fontSize: parentFontSizeNum,
          lineHeight: parentLineHeightNum,
          text: shortText
        });
      }
    });
    return data;
  });
  // Initialize the result and standard result.
  const totals = [0, data.length, 0, 0];
  const standardInstances = [];
  // If itemization is required:
  if (withItems) {
    // Add it to the standard result.
    data.forEach(item => {
      standardInstances.push({
        ruleID: 'lineHeight',
        what:
        `Text line height ${item.lineHeight} px is less than 1.5 times its font size ${item.fontSize} px`,
        ordinalSeverity: 1,
        tagName: item.tagName,
        id: item.id,
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: item.text
      });
    });
  }
  // Otherwise, i.e. if itemization is not required:
  else {
    // Add a summary instance to the standard result.
    standardInstances.push({
      ruleID: 'lineHeight',
      what: 'Text line heights are less than 1.5 times their font sizes',
      ordinalSeverity: 1,
      count: data.length,
      tagName: '',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    });
    // Delete the itemization from the result.
    data.length = 0;
  }
  return {
    data,
    totals,
    standardInstances
  };
};
