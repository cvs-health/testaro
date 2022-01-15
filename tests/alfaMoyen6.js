/*
  alfa
  This test implements the alfa ruleset for accessibility per Jean-Yves Moyen
*/

// IMPORTS
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
const alfaRules = require('@siteimprove/alfa-rules');
const {chromium} = require('playwright');

// FUNCTIONS
// Returns the alfa rule codes and summaries.
const getRules = async page => {
  const context = page.context();
  const rulePage = await context.newPage();
  rulePage.on('console', msg => {
    const msgText = msg.text();
    console.log(msgText);
  });
  const response = await rulePage.goto('https://alfa.siteimprove.com/rules');
  if (response.status() === 200){
    const ruleData = await rulePage.evaluate(() => {
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
    return ruleData;
  }
  else {
    return {};
  }
};
const temp = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const ruleData = await getRules(page);
  await page.close();
  await context.close();
  await browser.close();
  Scraper.with(async scraper => {
    for (const input of await scraper.scrape('https://tenon.io/')) {
      const audit = Audit.of(input, alfaRules.default);
      const outcomes = Array.from(await audit.evaluate());
      outcomes.forEach((outcome, index) => {
        const {target} = outcome;
        if (target && ! target._members) {
          const outcomeJ = outcome.toJSON();
          const verdict = outcomeJ.outcome;
          if (verdict !== 'passed') {
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
            const data = {
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
                codeLines: codeLines.map(line => line.length > 99 ? `${line.slice(0, 99)}...` : line)
              }
            };
            const etcTags = [];
            tags.forEach(tag => {
              if (tag.type === 'scope') {
                data.rule.scope = tag.scope;
              }
              else {
                etcTags.push(tag);
              }
            });
            if (etcTags.length) {
              data.etcTags = etcTags;
            }
            console.log(JSON.stringify(data, null, 2));
          }
        }
      });
    }
  });
};
temp();
