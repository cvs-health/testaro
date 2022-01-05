/*
  alfa
  This test implements the alfa ruleset for accessibility.
*/
import { Audit } from '@siteimprove/alfa-act';
import { Scraper } from '@siteimprove/alfa-scraper';

import rules from '@siteimprove/alfa-rules';

Scraper.with(async (scraper) => {
  for (const input of await scraper.scrape('http://example.com')) {
    const outcomes = await Audit.of(input, rules).evaluate();
    console.log(JSON.stringify(outcomes, null, 2));
  }
});
