/*
  rescore
  Returns a new score act for the acts of a report.
  Arguments:
    0. Path of the report relative to the script-report directory.
*/
const fs = require('fs');
require('dotenv').config();
const filePath = process.argv[2];
exports.rescorer = () => {
  const reportJSON = fs.readFileSync(`${process.env.REPORTDIR}/${filePath}`, 'utf8');
  const report = JSON.parse(reportJSON);
  const {acts} = report;
  const scoreAct = acts.filter(act => act.type === 'score').shift();
  if (scoreAct) {
    const scoreProcName = scoreAct.which;
    if (scoreProcName) {
      const scoreProc = require(`./${scoreProcName}`);
      return scoreProc.scorer(acts);
    }
    else {
      return 'ERROR: Score act has no scoreProc property';
    }
  }
  else {
    return 'ERROR: Report has no score act';
  }
};
console.log(JSON.stringify(exports.rescorer(), null, 2));
