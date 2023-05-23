/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/

// IMPORTS

const {Audit} = require('@siteimprove/alfa-act');
const {Playwright} = require('@siteimprove/alfa-playwright');
let alfaRules = require('@siteimprove/alfa-rules').default;

// FUNCTIONS

// Conducts and reports an alfa test.
exports.reporter = async (page, rules) => {
  // If only some rules are to be employed:
  if (rules && rules.length) {
    // Remove the other rules.
    alfaRules = alfaRules.filter(rule => rules.includes(rule.uri.replace(/^.+-/, '')));
  }
  // Get the document containing the summaries of the alfa rules.
  const context = page.context();
  const rulePage = await context.newPage();
  rulePage.on('console', msg => {
    const msgText = msg.text();
    console.log(msgText);
  });
  // Initialize the result.
  let data = {
    totals: {
      failures: 0,
      warnings: 0
    },
    items: []
  };
  try {
    const response = await rulePage.goto('https://alfa.siteimprove.com/rules', {timeout: 15000});
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
    // Test the page content with the specified rules.
    const doc = await page.evaluateHandle('document');
    const alfaPage = await Playwright.toPage(doc);
    const audit = Audit.of(alfaPage, alfaRules);
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
  catch(error) {
    console.log(`ERROR: navigation to URL timed out (${error})`);
    data = {
      result: {
        prevented: true,
        error: 'ERROR: navigation to URL timed out'
      }
    };
  }
  return {result: data};
};
