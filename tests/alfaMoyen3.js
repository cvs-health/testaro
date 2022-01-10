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
    console.log(`audit is an object with properties ${Object.keys(audit)}`);
    console.log(`Its _oracle property has type ${typeof audit._oracle}`);
    console.log(`Its _oracle function has code:\n${audit._oracle.toString()}`);
    console.log(
      `Its JSON conversion has properties ${Object.keys(JSON.parse(JSON.stringify(audit)))}`
    );
    // console.log(`It is:\n${JSON.stringify(audit, null, 2)}`);
    const outcomes = await audit.evaluate();
    console.log(JSON.stringify(`outcomes has type ${typeof outcomes}`));
    console.log(`outcomes has properties ${Object.keys(outcomes)}`);
    console.log(JSON.stringify(`outcomes is ${JSON.stringify(outcomes, null, 2)}`));
  }
});
