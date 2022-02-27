/*
  packageIssues
  Compiles a list of all issue types appearing in packageData.json.
*/
const fs = require('fs');
const compile = () => {
  const dataJSON = fs.readFileSync('scoring/package/data.json', 'utf8');
  const reportData = JSON.parse(dataJSON);
  const reports = Object.values(reportData);
  const data = {
    aatt: new Set(),
    alfa: new Set(),
    axe: new Set(),
    ibm: new Set(),
    wave: new Set()
  };
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
