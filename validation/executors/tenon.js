// tenon.js
// Test executor for tenon sample script.

const fs = require('fs');
const {doJob} = require('../../run');
const scriptJSON = fs.readFileSync('samples/scripts/tenon.json', 'utf8');
const script = JSON.parse(scriptJSON);
const report = {
  id: '',
  script,
  log: [],
  acts: []
};
(async () => {
  await doJob(report);
  console.log(`Report log:\n${JSON.stringify(report.log, null, 2)}\n`);
  console.log(`Report acts:\n${JSON.stringify(report.acts, null, 2)}`);
})();
