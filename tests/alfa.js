/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/

// IMPORTS

const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
let alfaRules = require('@siteimprove/alfa-rules').default;

// FUNCTIONS

// Conducts and reports an alfa test.
exports.reporter = async (page, rules) => {
  // If only some rules are to be employed:
  if (rules && rules.length) {
    // Remove the other rules.
    alfaRules = alfaRules.filter(rule => rules.includes(rule.uri.replace(/^.+-/, '')));
  }
  console.log(`alfa rules are ${JSON.stringify(alfaRules, null, 2)}`);
  // Get the document containing the summaries of the alfa rules.
  const context = page.context();
  const rulePage = await context.newPage();
  rulePage.on('console', msg => {
    const msgText = msg.text();
    console.log(msgText);
  });
  try {
    const response = await rulePage.goto('https://alfa.siteimprove.com/rules', {timeout: 10000});
    let ruleData = {};
    if (response.status() === 200) {
      // Compile data on the rule IDs and summaries.
      ruleData = await rulePage.evaluate(() => {
        const rulePs = Array.from(document.querySelectorAll('p.h5'));
        const ruleData = {};
        rulePs.forEach(ruleP => {
          const childNodes = Array.from(ruleP.childNodes);
          const ruleID = childNodes[0].textContent.slice(4).toLowerCase();
          const ruleText = childNodes
          .slice(1)
          .map(node => node.textContent)
          .join(' ')
          .trim()
          .replace(/"/g, '\'')
          .replace(/\s+/g, ' ');
          ruleData[ruleID] = ruleText;
        });
        return ruleData;
      });
      await rulePage.close();
    }
    await Scraper.with(async scraper => {
      // Request the page content.
      const scrapes = await scraper.scrape(page.url());
      // If the request failed:
      if (scrapes && typeof scrapes === 'object' && scrapes.type === 'err') {
        console.log('ERROR: Failed to get page content for alfa');
        return {result: {
          prevented: true,
          error: scrapes.error
        }};
      }
      // Otherwise, i.e. if the request succeeded:
      else {
        // Initialize the result.
        const data = {
          totals: {
            failures: 0,
            warnings: 0
          },
          items: []
        };
        console.log(`scrapes length is ${scrapes.length}`);
        // Test the page content with the specified rules.
        for (const input of scrapes) {
          const audit = Audit.of(input, alfaRules);
          const outcomes = Array.from(await audit.evaluate());
          // For each failure or warning:
          outcomes.forEach((outcome, index) => {
            const {target} = outcome;
            if (target && ! target._members) {
              const outcomeJ = outcome.toJSON();
              const verdict = outcomeJ.outcome;
              if (verdict !== 'passed') {
                // Add to the result.
                const {rule} = outcomeJ;
                const {tags, uri, requirements} = rule;
                const ruleID = uri.replace(/^.+-/, '');
                const ruleSummary = ruleData[ruleID] || '';
                const targetJ = outcomeJ.target;
                const codeLines = target.toString().split('\n');
                if (codeLines[0] === '#document') {
                  codeLines.splice(2, codeLines.length - 3, '...');
                }
                else if (codeLines[0].startsWith('<html')) {
                  codeLines.splice(1, codeLines.length - 2, '...');
                }
                const outcomeData = {
                  index,
                  verdict,
                  rule: {
                    ruleID,
                    ruleSummary,
                    scope: '',
                    uri,
                    requirements
                  },
                  target: {
                    type: targetJ.type,
                    tagName: targetJ.name || '',
                    path: target.path(),
                    codeLines: codeLines.map(line => line.length > 300 ? `${line.slice(0, 300)}...` : line)
                  }
                };
                const etcTags = [];
                tags.forEach(tag => {
                  if (tag.type === 'scope') {
                    outcomeData.rule.scope = tag.scope;
                  }
                  else {
                    etcTags.push(tag);
                  }
                });
                if (etcTags.length) {
                  outcomeData.etcTags = etcTags;
                }
                if (outcomeData.verdict === 'failed') {
                  data.totals.failures++;
                }
                else if (outcomeData.verdict === 'cantTell') {
                  data.totals.warnings++;
                }
                data.items.push(outcomeData);
              }
            }
          });
        }
        return {result: data};
      }
    });
  }
  catch(error) {
    console.log(`ERROR: navigation to URL timed out (${error})`);
    return {
      result: {
        prevented: true,
        error: 'ERROR: navigation to URL timed out'
      }
    };
  }
};
