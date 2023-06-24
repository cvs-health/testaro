/*
  targetSize
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
        textNodes.push(walker.currentNode);
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
      const parentLineHeightNum = Number.parseFloat(parentLineHeightText);
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
  const totals = [0, data.length, 0, 0];
  const standardInstances = [];
  if (withItems) {
    data.forEach(item => {
      standardInstances.push({
        ruleID: 'lineHeight',
        what:
        `Text line height ${item.lineHeight} px is less than 1.5 times its font size (${item.fontSize} px`,
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
  else {
    standardInstances.push({
      ruleID: 'lineHeight',
      what: 'Text line heights are less than 1.5 times their font size',
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
  }
  return {
    data,
    totals,
    standardInstances
  };
};
