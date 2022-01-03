/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
const {Rules} = require('@siteimprove/alfa-rules');
// Conducts and reports an alfa test.
exports.reporter = async () => {
  console.log('Starting to run reporter');
  // Get the data on the elements violating the default alfa rules.
  Scraper.with(async scraper => {
    console.log('Starting for loop');
    for (const input of await scraper.scrape('https://example.com/')) {
      console.log(`Input is ${JSON.stringify(input, null, 2)}`);
      const auditResult = Audit.of(input, Rules);
      console.log(`Audit result is ${JSON.stringify(auditResult, null, 2)}`);
      const auditRules = auditResult._rules;
      auditRules.forEach(async auditRule => {
        console.log(`Audit rule is ${JSON.stringify(auditRule, null, 2)}`);
        const evaluation = await auditRule[1].evaluate();
        console.log(`Evaluation is ${JSON.stringify(evaluation, null, 2)}`);
      });
    }
  });
};
exports.reporter();
