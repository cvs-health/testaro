// Compiles a report.
exports.reporter = async page => await page.$eval('body', body => {
  // Compile an array of list items documenting background images.
  const listItems = Array.from(body.querySelectorAll('*'))
  .map(element => [element, window.getComputedStyle(element).getPropertyValue('background-image')])
  .filter(pair => pair[1] && pair[1] !== 'none')
  .map(pair => [pair[1].slice(4, -1), pair[0].tagName.toLowerCase(), pair[0].textContent])
  .map(triple => `            <li><img src=${triple[0]}><br>${triple[1]}: ${triple[2]}</li>`);
  const exhibits = `          <ol>\n${listItems}\n          </ol>`;
  return {
    bgImageCount: listItems.length,
    exhibits
  };
});
