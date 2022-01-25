/*
  correlation
  Compiles a list of the correlations between distinct-package issue types.
*/
const fs = require('fs');
const compile = () => {
  const issuesJSON = fs.readFileSync('scoring/package/issues.json', 'utf8');
  const issues = JSON.parse(issuesJSON);
  const dataJSON = fs.readFileSync('scoring/package/data.json', 'utf8');
  const reportData = JSON.parse(dataJSON);
  const reports = Object.values(reportData);
  // Initialize the list.
  const data = {
    aatt_alfa: {},
    aatt_axe: {},
    aatt_ibm: {},
    aatt_wave: {},
    alfa_axe: {},
    alfa_ibm: {},
    alfa_wave: {},
    axe_ibm: {},
    axe_wave: {},
    ibm_wave: {}
  };
  // For each pair of packages:
  const packagePairs = Object.keys(data);
  packagePairs.forEach(packagePair => {
    console.log(`=== Starting package pair ${packagePair}`);
    const packages = packagePair.split('_');
    // Identify the reports containing results from both packages.
    const pairReports = reports.filter(report => report[packages[0]] && report[packages[1]]);
    // For each pair of issues:
    issues[packages[0]].forEach(issueA => {
      issues[packages[1]].forEach(issueB => {
        // Initialize an array of score pairs.
        const scorePairs = [];
        // For each applicable report:
        pairReports.forEach(report => {
          // Add the scores for the issues to the array of score pairs.
          const scorePair = [report[packages[0]][issueA] || 0, report[packages[1]][issueB] || 0];
          scorePairs.push(scorePair);
        });
        // Get the correlation between the issues.
        const aSum = scorePairs.reduce((sum, current) => sum + current[0], 0);
        const bSum = scorePairs.reduce((sum, current) => sum + current[1], 0);
        const abSum = scorePairs.reduce((sum, current) => sum + current[0] * current[1], 0);
        const aSqSum = scorePairs.reduce((sum, current) => sum + current[0] ** 2, 0);
        const bSqSum = scorePairs.reduce((sum, current) => sum + current[1] ** 2, 0);
        const n = scorePairs.length;
        const correlation
          = (abSum - aSum * bSum / n) / n
          / (Math.sqrt(aSqSum / n - (aSum / n) ** 2) * Math.sqrt(bSqSum / n - (bSum / n) ** 2));
        // If the correlation is large enough:
        if (correlation > 0.7) {
          // Record it.
          if (data[packagePair][issueA]) {
            data[packagePair][issueA][issueB] = correlation;
          }
          else {
            data[packagePair][issueA] = {issueB: correlation};
          }
        }
      });
    });
  });
  return data;
};
fs.writeFileSync('scoring/package/correlations.json', JSON.stringify(compile(), null, 2));
