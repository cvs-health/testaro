/*
  getTextNodes
  Gets the text nodes of a page and their parent elements as a JSHandle.
*/
exports.getTextNodes = async page => {
  // Identify the text nodes.
  const data = await page.evaluateHandle(() => {
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
    const compact = string => string.replace(/\s+/g, ' ').trim();
    // FUNCTION DEFINITION END
    // Create a collection of the text nodes.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let more = true;
    while(more) {
      if (walker.nextNode()) {
        const nodeText = walker.currentNode.nodeValue;
        const compactNodeText = compact(nodeText);
        if (compactNodeText) {
          data.push([nodeText, walker.currentNode.parentElement]);
        }
      }
      else {
        more = false;
      }
    }
    return data;
  });
  return data;
};
