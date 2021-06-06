/*
  axetally.js
  Converts an axe report to an all-acts tally of rule violations by severity.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## OPERATION
// Timestamp.
const timeStamp = process.argv[2];
// Report directory.
const reportDir = process.env.REPORTDIR || process.argv[3] || 'MISSING';
fs.readFile(`${reportDir}/report-axecounts-${timeStamp}.json`, 'utf8')
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
  fs.writeFile(
    `${reportDir}/report-axecounts-${timeStamp}.json`, `${JSON.stringify(rules, null, 2)}\n`
  );
});
