/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
const rules = require('@siteimprove/alfa-rules');
console.log(`rules type is ${typeof rules}`);
console.log(`rules keys are ${Object.keys(rules)}`);
console.log(`rules.Rules type is ${typeof rules.Rules}`);
console.log(`rules.Rules keys are ${Object.keys(rules.Rules)}`);
console.log('Audit, Scraper, and rules imported');
// Conducts and reports an alfa test.
exports.reporter = async () => {
  console.log('Starting to run reporter');
  // Get the data on the elements violating the default alfa rules.
  Scraper.with(async scraper => {
    const input = await scraper.scrape('https://userway.org/');
    console.log('URL scraped into input');
    const auditResult = Audit.of(input, rules.Rules);
    console.log(`Audit produced; type is ${typeof auditResult}`);
    console.log(`Audit keys are ${Object.keys(auditResult)}`);
    console.log(`Audit _oracle type is ${typeof auditResult._oracle}`);
    console.log(`Audit _oracle code is ${auditResult._oracle.toString()}`);
    const evaluation = auditResult.evaluate();
    console.log(`evaluation type is ${typeof evaluation}`);
    console.log(`evaluation keys are ${Object.keys(evaluation)}`);
    console.log(`evaluation._thunk is:\n${evaluation._thunk.toString()}`);
    console.log(`evaluation._mapper is:\n${evaluation._mapper.toString()}`);
    console.log(`evaluation’s own JSON is:\n${JSON.stringify(evaluation, null, 2)}`);
    /*
    auditRules.forEach(async auditRule => {
      // console.log(`Audit rule is ${JSON.stringify(auditRule, null, 2)}`);
      const evaluation = await auditRule[1].evaluate();
      console.log(`Evaluation is ${JSON.stringify(evaluation, null, 2)}`);
    });
    */
  });
};
exports.reporter();
