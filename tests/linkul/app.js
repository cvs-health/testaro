// Reports counts and fractions of underlined links among inline links adn lists them.
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
  const ulInLinkTexts = [];
  const nulInLinkTexts = [];
  inLinks.forEach(link => {
    if (window.getComputedStyle(link).textDecorationLine === 'underline') {
      ulInLinkTexts.push(link.textContent);
    }
    else {
      nulInLinkTexts.push(link.textContent);
    }
  });
  const ulPercent = inLinks.length
    ? Math.floor(100 * ulInLinkTexts.length / inLinks.length)
    : 'N/A';
  return {
    result: {
      tally: {
        links: links.length,
        inline: {
          total: inLinks.length,
          underlined: ulInLinkTexts.length,
          ulPercent
        }
      },
      list: {
        underlined: [ulInLinkTexts],
        plain: [nulInLinkTexts]
      }
    }
  };
});
