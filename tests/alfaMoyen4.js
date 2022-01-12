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
    const outcomes = Array.from(await audit.evaluate());
    outcomes.forEach(outcome => {
      const outcomeJSON = outcome.toJSON();
      const verdict = outcomeJSON.outcome;
      if (verdict === 'failed') {
        console.log(`outcome.toString() is ${outcome.toString.toString()}`);
        console.log(`outcome.toJSON() is ${outcome.toJSON.toString()}`);
        console.log(outcome.toJSON());
        const target = outcome._target;
        if (target._name === 'html') {
          console.log('html element');
        }
        else {
          console.log(JSON.stringify(target, null, 2));
        }
      }
    });
  }
});
