// hows informative images and the tag names and text contents of their elements.
exports.reporter = async page => await page.$eval('body', body => {
  // Compile an array of list items documenting informative images.
  const listItems = Array.from(body.querySelectorAll('img[alt][src]:not([alt=""]):not([src=""])'))
  .map((el, index) => [index, el.src, el.alt])
  .map(
    data =>
      `            <li><img alt="image ${data[0]}" src="${data[1]}"><br>${data[2]}</li>`
  );
  const exhibits = `          <ol>\n${listItems.join('\n')}\n          </ol>`;
  return {
    result: {
      infImageCount: listItems.length
    },
    exhibits
  };
});
