// Makes all elements in a page visible.
exports.allVis = async page => {
  await page.evaluate(() => {
    const elements = Array.from(document.body.querySelectorAll('*'));
    elements.forEach(element => {
      const styleDec = window.getComputedStyle(element);
      if (styleDec.display === 'none') {
        element.style.display = 'unset';
      }
      if (styleDec.visibility === 'hidden') {
        element.style.visibility = 'unset';
      }
    });
  });
};
