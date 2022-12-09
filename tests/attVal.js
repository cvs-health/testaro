/*
  attVal
  This test reports attributes with illicit values.
*/
exports.reporter = async (page, attributeName, licitValues, withItems) => {
  // Identify the elements that have the specified attribute with illicit values.
  const badAttributeData = await page.evaluate(
    args => {
      const attributeName = args[0];
      const licitValues = args[1];
      // Returns the text of an element.
      const textOf = async (element, limit) => {
        let text = element.textContent;
        text = text.trim() || element.innerHTML;
        return text.replace(/\s+/sg, ' ').replace(/<>&/g, '').slice(0, limit);
      };
      const attributeElements = Array.from(document.body.querySelectorAll(`[${attributeName}]`));
      const badElements = attributeElements
      .filter(el => ! licitValues.includes(el.getAttribute(attributeName)));
      const report = badElements.map(el => ({
        tagName: el.tagName,
        textStart: textOf(el, 70),
        attributeValue: el.getAttribute(attributeName)
      }));
      return report;
    },
    [attributeName, licitValues]
  );
  const data = {
    total: badAttributeData.length
  };
  if (withItems) {
    data.items = badAttributeData;
  }
  return {result: data};
};
