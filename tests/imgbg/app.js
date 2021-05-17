// Compiles a report.
exports.reporter = async page => {
  // Get an array of data on all background images.
  const data = await page.$eval('body', body => {
    const elements = Array.from(body.querySelectorAll('*'));
    const bgData = elements.map(element => {
      const bgStyle = window.getComputedStyle(element).getPropertyValue('background-image');
      if (bgStyle && bgStyle !== 'none') {
        return [bgStyle.slice(4, -1), element.tagName.toLowerCase(), element.textContent];
      }
      else {
        return [];
      }
    });
    const usableData = bgData.filter(item => item.length);
    return usableData;
  });
  // Return it as an array of list items.
  return {
    json: false,
    data: data.map(item => `<li><img src=${item[0]}><br>${item[1]}: ${item[2]}</li>`)
  };
};
