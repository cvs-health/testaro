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
              console.log(
                `  It is an object with properties ${Object.getOwnPropertyNames(value[key])}`
              );
            }
          });
        });
        ['target', 'expectations', 'equals'].forEach(protoKey => {
          console.log(
            `Outcome ${index} has prototype property ${protoKey} with type ${typeof outcome[protoKey]}`
          );
        });
        const {target} = outcome;
        console.log(
          `Outcome target object has properties ${Object.getOwnPropertyNames(target)}`
        );
        const targetProto = Object.getPrototypeOf(target);
        console.log(`Target prototype has properties ${Object.getOwnPropertyNames(targetProto)}`);
        console.log(`Target toJSON method has code ${target.toJSON.toString()}`);
        const targetJO = target.toJSON();
        console.log(`Result of that method has type ${typeof targetJO}`);
        console.log(`Result has properties ${Object.getOwnPropertyNames(targetJO)}`);
        const targetJOProto = Object.getPrototypeOf(targetJO);
        console.log(`Its prototype has properties ${Object.getOwnPropertyNames(targetJOProto)}`);
        console.log(`Target toString() result is:\n${target.toString()}`);
      }
    });
  }
});
