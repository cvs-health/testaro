/*
  jhuAxeR.js
  Converts an axeS report to a Rankless JHU-Axe report listing per-URL scores.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// ########## CONSTANTS
// Weights.
const weights = {
  minorCount: 1,
  moderateCount: 2,
  seriousCount: 3,
  criticalCount: 4,
  minorDensity: 0.5,
  moderateDensity: 1,
  seriousDensity: 1.5,
  criticalDensity: 2,
};
// Timestamp.
const timeStamp = process.argv[2];
// Report directory.
const reportDir = process.env.REPORTDIR || process.argv[3] || 'MISSING';
// ########## FUNCTIONS
// Distills the report into the relevant array.
const distill = async () => {
  // Get the report.
  const reportJSON = await fs.readFile(`${reportDir}/report-${timeStamp}.json`, 'utf8');
  const report = JSON.parse(reportJSON);
  // Distill it into the relevant array.
  const relArray = report
  .acts
  .filter(act =>
    act.type === 'axeS'
    && act.which
    && act.url
    && act.result
    && act.result.elementCount
    && act.result.violations
    && act.result.violations.minor > -1
    && act.result.violations.moderate > -1
    && act.result.violations.serious > -1
    && act.result.violations.critical > -1
  )
  .map((act, index) => ({
    index,
    url: act.url,
    name: act.which,
    elementCount: act.result.elementCount,
    minorCount: act.result.violations.minor,
    moderateCount: act.result.violations.moderate,
    seriousCount: act.result.violations.serious,
    criticalCount: act.result.violations.critical,
    minorDensity: act.result.violations.minor / act.result.elementCount,
    moderateDensity: act.result.violations.moderate / act.result.elementCount,
    seriousDensity: act.result.violations.serious / act.result.elementCount,
    criticalDensity: act.result.violations.critical / act.result.elementCount
  }));
  // Return the relevant array.
  return relArray;
};
// Adds scores to the elements of an array of rank data on pages.
const score = (relArray, termNames) => relArray.forEach(act => {
  act.score = Math.floor(
    termNames.reduce((total, termName) => total + weights[termName] * act[termName], 0)
  );
});
// Creates and records an HTML report.
const webify = relArray => {
  const data = relArray.map(
    act => `<tr><td>${act.score}</td><td>${act.name}</td><td>${act.url}</td></tr>`
  ).join('\n         ');
  const page = `<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <title>Web-page accessibility comparison</title>
    <meta
      name="description"
      content="Comparison of accessibility of web pages per the JHU-Axes rule"
    >
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="favicon.png">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <h1>Web-page accessibility comparison</h1>
      <section class="etc wide">
        <p>The table below ranks and scores web pages on accessibility, as measured by the <dfn>Rankless JHU-Axes rule</dfn>, derived from the JHU-WAVE rule, used by the Johns Hopkins University Disability Health Research Center in producing its <a href="https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/">Vaccine Website Accessibility dashboard</a>. This derivation uses the axe-core ruleset instead of the WAVE ruleset and reports sums of the weighted violations and densities, not weighted ranks. In generating a deficit score, this rule weighs minor, moderate, serious, and critical violations 1, 2, 3, and 4, respectively, and weights their densities 0.5, 1, 1.5, and 2, respectively.</p>
        <p>This table was produced with <a href="https://github.com/jrpool/autotest">Autotest</a>.</p>
        <table>
          <caption>Results of Rankless JHU-Axes test of web pages</caption>
          <thead>
            <tr><th>Deficit</th><th>Name</th><th>URL</th></tr>
          </thead>
          <tbody class="firstCellRight">
          ${data}
          </tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`;
  fs.writeFile(`${reportDir}/report-jhuar-${timeStamp}.html`, page);
};
// ########## OPERATION
(async () => {
  const relArray = await distill();
  if (relArray.length) {
    score(relArray, [
      'minorCount',
      'moderateCount',
      'seriousCount',
      'criticalCount',
      'minorDensity',
      'moderateDensity',
      'seriousDensity',
      'criticalDensity',
    ]);
    relArray.sort((a, b) => a.score - b.score);
    fs.writeFile(`${reportDir}/report-jhuar-${timeStamp}.json`, JSON.stringify(relArray, null, 2));
    webify(relArray);
    fs.copyFile('style.css', `${reportDir}/style.css`, fs.constants.COPYFILE_EXCL);
  }
  else {
    console.log('ERROR: Related array of act reports empty');
  }
})();
