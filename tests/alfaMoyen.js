/*
  alfa
  This test implements the alfa ruleset for accessibility per Jean-Yves Moyen
*/
'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const alfa_act_1 = require('@siteimprove/alfa-act');
const alfa_scraper_1 = require('@siteimprove/alfa-scraper');
const alfa_rules_1 = require('@siteimprove/alfa-rules');

alfa_scraper_1.Scraper.with(async (scraper) => {
  for (const input of await scraper.scrape('https://www.barclaydamon.com/')) {
    const outcomes = await alfa_act_1.Audit.of(input, alfa_rules_1.default).evaluate();
    console.log(JSON.stringify(outcomes, null, 2));
  }
});
