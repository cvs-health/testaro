// tenon.js
// Test executor for tenon sample script.

const fs = require('fs');
const {handleRequest} = require('../../index');
const scriptJSON = fs.readFileSync('samples/scripts/tenon.json', 'utf8');
const script = JSON.parse(scriptJSON);
const report = {
  id: '',
  script,
  log: [],
  acts: []
};
(async () => {
  process.env.TESTARO_TENON_KEY = '67e531e0118504a251b719faa8c164cd';
  await handleRequest(report);
  console.log(`Report log:\n${JSON.stringify(report.log, null, 2)}\n`);
  console.log(`Report acts:\n${JSON.stringify(report.acts, null, 2)}`);
})();
