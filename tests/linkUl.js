/*
  linkUl
  This test reports failures to underline inline links. Underlining and color are the
  traditional style properties that identify links. Collections of links in blocks can be
  recognized without underlines, but inline links are difficult or impossible to distinguish
  visually from surrounding text if not underlined. Underlining inline links only on hover
  provides an indicator valuable only to mouse users, and even they must traverse the text with
  a mouse merely to discover which passages are links.
*/
exports.reporter = async (page, withItems) => {
  // Identify the links in the page, by type.
  const linkTypes = await require('../procs/linksByType').linksByType(page);
  return await page.evaluate(args => {
    const withItems = args[0];
    const linkTypes = args[1];
    // FUNCTION DEFINITION START
    // Returns a space-minimized copy of a string.
    const compact = string => string.replace(/[\t\n]/g, '').replace(/\s{2,}/g, ' ').trim();
    // FUNCTION DEFINITION END
    // Identify the inline links.
    const inLinks = linkTypes.inline;
    const inLinkCount = inLinks.length;
    let underlined = 0;
    const ulInLinkTexts = [];
    const nulInLinkTexts = [];
    // For each of them:
    inLinks.forEach(link => {
      // Identify the text of the link if itemization is required.
      const text = withItems ? compact(link.textContent) : '';
      // If it is underlined:
      if (window.getComputedStyle(link).textDecorationLine === 'underline') {
        // Increment the count of underlined inline links.
        underlined++;
        // If required, add its text to the array of their texts.
        if (withItems) {
          ulInLinkTexts.push(text);
        }
      }
      // Otherwise, if it is not underlined and itemization is required:
      else if (withItems) {
        // Add its text to the array of texts of non-underlined inline links.
        nulInLinkTexts.push(text);
      }
    });
    // Get the percentage of underlined links among all inline links.
    const underlinedPercent = inLinkCount ? Math.floor(100 * underlined / inLinkCount) : 'N/A';
    const data = {
      totals: {
        links: inLinks.length + linkTypes.block.length,
        inline: {
          total: inLinkCount,
          underlined,
          underlinedPercent
        }
      }
    };
    if (withItems) {
      data.items = {
        underlined: ulInLinkTexts,
        notUnderlined: nulInLinkTexts
      };
    }
    return {result: data};
  }, [withItems, linkTypes]);
};
