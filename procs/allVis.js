// Makes all elements in a page visible.
exports.allVis = async page => {
  await page.$$eval('body *', elements => {
    elements.forEach(element => {
      const styleDec = window.getComputedStyle(element);
      if (styleDec.display === 'none') {
        element.style.display = 'initial';
      }
      if (['hidden', 'collapse'].includes(styleDec.visibility)) {
        element.style.visibility = 'inherit';
      }
    });
  })
  .catch(error => {
    console.log(`ERROR making all elements visible (${error.message})`);
  });
};
