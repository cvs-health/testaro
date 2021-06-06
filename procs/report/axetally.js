/*
  axetally.js
  Converts an axe report to a tally of rule violations by severity.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## OPERATION
const prefix = process.argv[2];
fs.readFile(`report-${prefix}axe.json`, 'utf8')
.then(axeJSON => {
  const axeActs = JSON.parse(axeJSON).acts.filter(act => act.type === 'axe');
  const rules = {
    critical: {},
    serious: {},
    moderate: {},
    minor: {}
  };
  axeActs.forEach(axeAct => {
    axeAct.result.forEach(rule => {
      rule.elements.forEach(element => {
        const total = rules[element.impact];
        if (total[rule.rule]) {
          total[rule.rule]++;
        }
        else {
          total[rule.rule] = 1;
        }
      });
    });
  });
  fs.writeFile(`axetally-${prefix}.json`, `${JSON.stringify(rules, null, 2)}\n`);
});
