/*
  miniText
  Derived from the bbc-a11y textCannotBeTooSmall test.
  This test reports text nodes smaller than 11 pixels.
*/
exports.reporter = async (page, withItems) => {
  // Identify the text nodes smaller than 11 pixels.
  const miniTexts = await page.$$eval(
    'body *:not(script, style):visible',
    elements => {
      // FUNCTION DEFINITION START
      // Returns a space-minimized copy of a string.
      const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
      // FUNCTION DEFINITION END
      const textParents = new Set();
      const miniTexts = [];
      elements.forEach(element => {
        element.childNodes.forEach(node => {
          if (node.nodeType === 3) {
            const nodeText = compact(node.textContent);
            if (nodeText) {
              textParents.add(element);
            }
          }
        });
      });
      textParents.forEach(textParent => {
        const {fontSize} = window.getComputedStyle(textParent);
        const pixels = Number.parseInt(fontSize);
        if (pixels < 11) {
          textParent.childNodes.forEach(node => {
            if (node.nodeType === 3 && compact(node.textContent)) {
              miniTexts.push(compact(node.textContent));
            }
          });
        }
      });
      return miniTexts;
    }
  );
  const data = {
    totals: miniTexts.length
  };
  if (withItems) {
    data.items = miniTexts;
  }
  return {result: data};
};
