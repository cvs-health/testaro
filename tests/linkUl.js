/*
  linkUl
  This test reports failures to underline links that are adjacent to nonlink text. Underlining
  and color are the traditional style properties that identify links. Lists of links containing
  only links can be recognized without underlines, but other links are difficult or impossible to
  distinguish visually from surrounding text if not underlined. Underlining adjacent links only on
  hover provides an indicator valuable only to mouse users, and even they must traverse the text
  with a mouse merely to discover which passages are links. This tests treats links as adjacent
  unless they are in an ordered or unordered list of at least 2 links with no other text.
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
    // Identify the adjacent links.
    const adjacentLinks = linkTypes.adjacent;
    const adjacentLinkCount = adjacentLinks.length;
    let underlined = 0;
    const ulAdjacentLinkTexts = [];
    const nulAdjacentLinkTexts = [];
    // For each of them:
    adjacentLinks.forEach(link => {
      // Identify the text of the link if itemization is required.
      const text = withItems ? compact(link.textContent) : '';
      // If it is underlined:
      if (window.getComputedStyle(link).textDecorationLine === 'underline') {
        // Increment the count of underlined inline links.
        underlined++;
        // If required, add its text to the array of their texts.
        if (withItems) {
          ulAdjacentLinkTexts.push(text);
        }
      }
      // Otherwise, if it is not underlined and itemization is required:
      else if (withItems) {
        // Add its text to the array of texts of non-underlined inline links.
        nulAdjacentLinkTexts.push(text);
      }
    });
    // Get the percentage of underlined links among all inline links.
    const underlinedPercent = adjacentLinkCount
      ? Math.floor(100 * underlined / adjacentLinkCount)
      : 'N/A';
    const data = {
      totals: {
        links: adjacentLinks.length + linkTypes.list.length,
        adjacent: {
          total: adjacentLinkCount,
          underlined,
          underlinedPercent
        }
      }
    };
    if (withItems) {
      data.items = {
        underlined: ulAdjacentLinkTexts,
        notUnderlined: nulAdjacentLinkTexts
      };
    }
    const {adjacent} = data.totals;
    const totals = [adjacent.total - adjacent.underlined];
    const standardInstances = [];
    if (data.items && data.items.notUnderlined) {
      data.items.notUnderlined.foreach(item => {
        standardInstances.push({
          issueID: 'linkUl',
          what: 'Element a is inline but has no underline',
          ordinalSeverity: 0,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item
        });
      });
    }
    return {
      data,
      totals,
      standardInstances
    };
  }, [withItems, linkTypes]);
};
