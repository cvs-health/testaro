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
    const packages = packagePair.split('_');
    // For each pair of issues:
    issues[packages[0]].forEach(issueA => {
      issues[packages[1]].forEach(issueB => {
        // Initialize an array of report score pairs.
        const scorePairs = [];
        // For each report:
        reports.forEach(report => {
          // If it contains results from both packages:
          if (report[packages[0] && report[packages[1]]]) {
            // Add them to the array of report score pairs.
            const scorePair = [];
            scorePair.push(packages[0][issueA] || 0, packages[1][issueB] || 0);
            scorePairs.push(scorePair);
          }
        });
        // Get the correlation between the issues.
        const aSum = scorePairs.reduce((sum, current) => sum + current[0], 0);
        const bSum = scorePairs.reduce((sum, current) => sum + current[1], 0);
        const abSum = scorePairs.reduce((sum, current) => sum + current[0] * current[1], 0);
        const aSqSum = scorePairs.reduce((sum, current) => sum + current[0] ^ 2, 0);
        const bSqSum = scorePairs.reduce((sum, current) => sum + current[1] ^ 2, 0);
        const n = scorePairs.length;
        const correlation
          = (abSum / n - aSum * bSum / n ^ 2)
          / (Math.sqrt(aSqSum / n - (aSum / n) ^ 2) * Math.sqrt(bSqSum / n - (bSum / n) ^ 2));
      });
    });
  });
  reports.forEach(entry => {
    Object.keys(entry).forEach(key => {
      if (entry[key] !== null) {
        Object.keys(entry[key]).forEach(issueName => {
          data[key].add(issueName);
        });
      }
    });
  });
  return {
    aatt: Array.from(data.aatt).sort(),
    alfa: Array.from(data.alfa).sort(),
    axe: Array.from(data.axe).sort(),
    ibm: Array.from(data.ibm).sort(),
    wave: Array.from(data.wave).sort()
  };
};
fs.writeFileSync('scoring/package/issues.json', JSON.stringify(compile(), null, 2));
