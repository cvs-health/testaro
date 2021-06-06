/*
  jhuaxe.js
  Converts an axes report to JSON and HTML JHU-Axe reports listing per-URL scores.
  This proc requires 2 arguments:
    0. the suffix of the base of the name of the axes report.
    1. the suffix of the base of the name of the JHU-Axe report.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// Module to keep secrets local.
require('dotenv').config();
// ########## CONSTANTS
// Filenames.
const axesSuffix = process.argv[2] || 'MISSING';
const jhuAxeSuffix = process.argv[3] || 'MISSING';
// Weights.
const weights = {
  minorRank: 1,
  moderateRank: 2,
  seriousRank: 3,
  criticalRank: 4,
  minorDensityRank: 0.5,
  moderateDensityRank: 1,
  seriousDensityRank: 1.5,
  criticalDensityRank: 2,
};
// Report directory.
const reportDir = process.env.REPORTDIR || 'MISSING';
// ########## FUNCTIONS
// Distills the report into the relevant array.
const distill = async () => {
  // Get the report.
  const reportJSON = await fs.readFile(`${reportDir}/report-${axesSuffix}.json`, 'utf8');
  const report = JSON.parse(reportJSON);
  // Distill it into the relevant array.
  const relArray = report
  .acts
  .filter(act =>
    act.type === 'axes'
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
    elementCount: act.result.elementcount,
    minorCount: act.result.violations.minor,
    moderateCount: act.result.violations.moderate,
    seriousCount: act.result.violations.serious,
    criticalCount: act.result.violations.critical
  }));
  // Return the relevant array.
  return relArray;
};
// Assigns ranks to pages on a criterion.
const rank = (relArray, rankName, sorter) => {
  // Sort the relevant array of objects by the specified criterion.
  relArray.sort((a, b) => sorter(a) - sorter(b));
  // Assign the first sorted page the rank 0 and initialize 0 as the last rank.
  let lastRank = relArray[0][rankName] = 0;
  // For each subsequent page:
  for (let i = 1; i < relArray.length; i++) {
    // If it is tied with the previous page:
    if (sorter(relArray[i]) === sorter(relArray[i - 1])) {
      // Assign it the same rank as the previous page.
      relArray[i][rankName] = relArray[i - 1][rankName];
      // Skip a rank.
      lastRank++;
    }
    // Otherwise, i.e. if it is not tied with the previous page:
    else {
      // Increment the last rank and assign it to the page.
      relArray[i][rankName] = ++lastRank;
    }
  }
};
// Adds scores to the elements of an array of rank data on pages.
const score = (relArray, rankNames) => relArray.forEach(act => {
  act.score = Math.floor(
    8 / 11 * rankNames.reduce((total, rankName) => total + weights[rankName] * act[rankName], 0)
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
        <p>The table below ranks and scores web pages on accessibility, as measured by the <dfn>JHU-Axes rule</dfn>, derived from the WHU-WAVE rule, used by the Johns Hopkins University Disability Health Research Center in producing its <a href="https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/">Vaccine Website Accessibility dashboard</a>. This derivation uses the axe-core ruleset instead of the WAVE ruleset. In generating a deficit score, this rule weighs minor, moderate, serious, and critical violations 1, 2, 3, and 4, respectively, and weights their densities 0.5, 1, 1.5, and 2, respectively. The computed score is decreased by 3/11 for comparability with the JHU-WAVE rule.</p>
        <p>This table was produced with <a href="https://github.com/jrpool/autotest">Autotest</a>.</p>
        <table>
          <caption>Results of JHU-Axes test of web pages</caption>
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
  fs.writeFile(`${reportDir}/report-${jhuAxeSuffix}.html`, page);
};
// ########## OPERATION
(async () => {
  const relArray = await distill();
  if (relArray.length) {
    rank(relArray, 'minorRank', a => a.minorCount);
    rank(relArray, 'moderateRank', a => a.moderateCount);
    rank(relArray, 'seriousRank', a => a.seriousCount);
    rank(relArray, 'criticalRank', a => a.criticalCount);
    rank(relArray, 'minorDensityRank', a => a.minorCount / a.elementCount);
    rank(relArray, 'moderateDensityRank', a => a.moderateCount / a.elementCount);
    rank(relArray, 'seriousDensityRank', a => a.seriousCount / a.elementCount);
    rank(relArray, 'criticalDensityRank', a => a.criticalCount / a.elementCount);
    score(relArray, [
      'minorRank',
      'moderateRank',
      'seriousRank',
      'criticalRank',
      'minorDensityRank',
      'moderateDensityRank',
      'seriousDensityRank',
      'criticalDensityRank',
    ]);
    relArray.sort((a, b) => a.score - b.score);
    fs.writeFile(`${reportDir}/report-${jhuAxeSuffix}.json`, JSON.stringify(relArray, null, 2));
    webify(relArray);
    fs.copyFile('style.css', `${reportDir}/style.css`, fs.constants.COPYFILE_EXCL);
  }
  else {
    console.log('ERROR: Related array of act reports is empty');
  }
})();
