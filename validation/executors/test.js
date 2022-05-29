// test.js
// Test executor.

const fs = require('fs');
const {handleRequest} = require('../../run');
const scriptJSON = fs.readFileSync('samples/scripts/simple.json', 'utf8');
const script = JSON.parse(scriptJSON);
const report = {
  id: '',
  script,
  log: [],
  acts: []
};
(async () => {
  await handleRequest(report);
  console.log(`Report log:\n${JSON.stringify(report.log, null, 2)}\n`);
  console.log(`Report acts:\n${JSON.stringify(report.acts, null, 2)}`);
})();
