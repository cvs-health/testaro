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
    outcomes.forEach((outcome, index) => {
      const entries = Object.entries(outcome);
      if (entries.length > 1) {
        console.log(`=============\nOutcome ${index}`);
        console.log(`Outcome path is ${outcome._target.path()}`);
        const outcomeProto = Object.getPrototypeOf(outcome);
        const protoProps = Object.getOwnPropertyNames(outcomeProto);
        console.log(`Outcome prototype has properties ${protoProps}`);
        protoProps.forEach(protoProp => {
          console.log(`Prototype property ${protoProp} has type ${typeof outcomeProto[protoProp]}`);
        });
        entries.forEach((entry, index) => {
          console.log(`\nEntry ${index} has key ${entry[0]}`);
          const value = entry[1];
          const valueKeys = Object.getOwnPropertyNames(value);
          console.log(`Its value is an object with property names ${valueKeys}`);
          valueKeys.forEach(key => {
            console.log(`Value ${key} has type ${typeof value[key]}`);
            if (Array.isArray(value[key])) {
              console.log(`  It is an array of length ${value[key].length}`);
            }
            else if (typeof value[key] === 'object') {
              console.log(`  It is an object with properties ${Object.getOwnPropertyNames(value[key])}`);
            }
          });
        });
      }
    });
  }
});
