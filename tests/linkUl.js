// Returns counts, fractions, and texts of inline links, by whether underlined.
exports.reporter = async (page, withItems) => {
  // Identify the links in the page, by type.
  const linkTypes = await require('../procs/test/linksByType').linksByType(page);
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
