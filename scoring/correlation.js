/*
  correlation
  Compiles a list of the correlations between distinct-package issue types and creates a file,
  correlations.json, containing the list.
*/
const fs = require('fs');
const compile = () => {
  const issuesJSON = fs.readFileSync(`${__dirname}/package/issues.json`, 'utf8');
  const issues = JSON.parse(issuesJSON);
  const dataJSON = fs.readFileSync(`${__dirname}/package/data.json`, 'utf8');
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
          const roundedCorr = correlation.toFixed(2);
          // Record it and the count of non-zero scores.
          const nonZero = scorePairs.reduce(
            (count, current) => count + current.filter(score => score).length, 0
          );
          const corrPlusNZ = `${roundedCorr} (${nonZero})`;
          if (data[packagePair][issueA]) {
            data[packagePair][issueA][issueB] = corrPlusNZ;
          }
          else {
            data[packagePair][issueA] = {[issueB]: corrPlusNZ};
          }
        }
      });
    });
  });
  return data;
};
fs.writeFileSync(
  `${__dirname}/package/correlations.json`, JSON.stringify(compile(), null, 2)
);
