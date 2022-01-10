/*
  alfa
  This test implements the alfa ruleset for accessibility per Jean-Yves Moyen
*/
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
const alfaRules = require('@siteimprove/alfa-rules');
Scraper.with(async scraper => {
  for (const input of await scraper.scrape('https://example.com/')) {
    const audit = Audit.of(input, alfaRules.default);
    console.log(`audit is\n${JSON.stringify(audit, null, 2)}`);
    const outcomes = await audit.evaluate();
    console.log(JSON.stringify(`outcomes has type ${typeof outcomes}`));
    console.log(JSON.stringify(`outcomes is ${JSON.stringify(outcomes, null, 2)}`));
  }
});
