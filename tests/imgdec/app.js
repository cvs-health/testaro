// Compiles a report.
exports.reporter = async page => {
  // Get an array of data on all decorative images.
  const data = await page.$eval('body', body => {
    const elements = Array.from(body.querySelectorAll('img[alt=""][src]:not([src=""])'));
    const elsData = elements.map(el => {
      const elData = [el.src];
      const parent = el.parentElement;
      elData.push(parent.tagName.toLowerCase(), parent.textContent);
      return elData;
    });
    return elsData;
  });
  // Return a report object.
  return {
    json: false,
    data: data.length ? data.map(
      (item, index) =>
        `<li><img alt="image ${index}" src="${item[0]}"><br>${item[1]}: ${item[2]}</li>`
    ) : ['<li><strong>None</strong></li>']
  };
};
