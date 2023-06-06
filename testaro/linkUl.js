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
    const compact = string => string
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
    // FUNCTION DEFINITION END
    // Identify the adjacent links.
    const adjacentLinks = linkTypes.adjacent;
    const adjacentLinkCount = adjacentLinks.length;
    let underlined = 0;
    const ulAdjacentLinkData = [];
    const nulAdjacentLinkData = [];
    // For each of them:
    adjacentLinks.forEach(link => {
      // Identify the text of the link if itemization is required.
      const id = link.id;
      const text = withItems ? compact(link.textContent) || compact(link.outerHTML) : '';
      // If it is underlined:
      if (window.getComputedStyle(link).textDecorationLine === 'underline') {
        // Increment the count of underlined inline links.
        underlined++;
        // If required, add its data to the array of their data.
        if (withItems) {
          ulAdjacentLinkData.push({
            id,
            text
          });
        }
      }
      // Otherwise, if it is not underlined and itemization is required:
      else if (withItems) {
        // Add its text to the array of texts of non-underlined inline links.
        nulAdjacentLinkData.push({
          id,
          text
        });
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
        underlined: ulAdjacentLinkData,
        notUnderlined: nulAdjacentLinkData
      };
    }
    const {adjacent} = data.totals;
    const totals = [0, adjacent.total - adjacent.underlined, 0, 0];
    const standardInstances = [];
    if (data.items && data.items.notUnderlined) {
      data.items.notUnderlined.forEach(item => {
        standardInstances.push({
          issueID: 'linkUl',
          what: 'Element a is inline but has no underline',
          ordinalSeverity: 1,
          tagName: 'A',
          id: item.id,
          location: {
            doc: '',
            type: '',
            spec: ''
          },
          excerpt: item.text
        });
      });
    }
    else if (adjacent.total - adjacent.underlined > 0) {
      standardInstances.push({
        issueID: 'linkUl',
        what: 'Inline links are missing underlines',
        count: adjacent.total - adjacent.underlined,
        ordinalSeverity: 1,
        tagName: 'A',
        id: '',
        location: {
          doc: '',
          type: '',
          spec: ''
        },
        excerpt: ''
      });
    }
    return {
      data,
      totals,
      standardInstances
    };
  }, [withItems, linkTypes]);
};
