// Compiles a report.
exports.reporter = async page => {
  // Get an array of data on all informative images.
  const data = await page.$eval('body', body => {
    const elements = Array.from(body.querySelectorAll('img[alt][src]:not([alt=""]):not([src=""])'));
    return elements.map(el => [el.src, el.alt]);
  });
  // Return a report object.
  return {
    json: false,
    data: data.map(
      (item, index) =>
        `<li><img alt="image ${index}" src="${item[0]}"><br>${item[1]}</li>`
    )
  };
};
