// Reports counts and fractions of underlined links among inline links.
exports.reporter = async page => await page.$eval('body', body => {
  const isTexty = node => {
    if (node) {
      if (node.nodeType === Node.ELEMENT_NODE && node.TagName === 'SPAN') {
        return true;
      }
      else if (node.nodeType === Node.TEXT_NODE) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  };
  const links = Array.from(body.getElementsByTagName('a'));
  const inLinks = links.filter(link => isTexty(link.previousSibling) || isTexty(link.nextSibling));
  const ulInLinks = inLinks.filter(
    link => window.getComputedStyle(link).textDecorationLine === 'underline'
  );
  const ulPercent = inLinks.length ? Math.floor(100 * ulInLinks.length / inLinks.length) : 'N/A';
  return {
    result: {
      links: links.length,
      inline: {
        total: inLinks.length,
        underlined: ulInLinks.length,
        ulPercent
      }
    }
  };
});
