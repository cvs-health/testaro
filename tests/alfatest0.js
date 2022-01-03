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
      const auditResult = Audit.of(input, Rules);
      console.log(`Audit result is ${JSON.stringify(auditResult, null, 2)}`);
      const evaluation = await auditResult.evaluate();
      console.log(`Evaluation is ${JSON.stringify(evaluation, null, 2)}`);
    }
  });
};
exports.reporter();
