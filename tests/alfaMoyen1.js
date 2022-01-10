/*
  alfa
  This test implements the alfa ruleset for accessibility per Jean-Yves Moyen
*/
// 'use strict';
// Object.defineProperty(exports, '__esModule', {value: true});
const {Audit} = require('@siteimprove/alfa-act');
const {Scraper} = require('@siteimprove/alfa-scraper');
const alfaRules = require('@siteimprove/alfa-rules');
console.log(`default type is ${typeof alfaRules.default}`);

Scraper.with(async (scraper) => {
  for (const input of await scraper.scrape('https://www.barclaydamon.com/')) {
    const outcomes = await Audit.of(input, alfaRules.default).evaluate();
    console.log(JSON.stringify(`outcomes has type ${typeof outcomes}`));
    console.log(JSON.stringify(`outcomes is ${JSON.stringify(outcomes, null, 2)}`));
  }
});
