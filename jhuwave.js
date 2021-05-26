/*
  jhuwave.js
  Implementation of the JHU-WAVE rule.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## CONSTANTS
// Weights.
const weights = {
  errorRank: 6,
  densityRank: 3,
  alertRank: 1
};
// Timestamp.
const timeStamp = process.argv[2];
// Report file.
const reportFileName = `report-${timeStamp}.json`;
// ########## FUNCTIONS
// Distills the report into the relevant array.
const distill = async () => {
  // Get the report.
  const reportJSON = await fs.readFile(reportFileName, 'utf8');
  const report = JSON.parse(reportJSON);
  // Distill it into the relevant array.
  const relArray = report
  .acts
  .filter(act =>
    act.type === 'waves'
    && act.which
    && act.which.url
    && act.which.name
    && act.result
    && act.result.statistics
    && act.result.statistics.totalelements
    && act.result.categories
    && act.result.categories.error
    && act.result.categories.error.count > -1
    && act.result.categories.contrast
    && act.result.categories.contrast.count > -1
    && act.result.categories.alert
    && act.result.categories.alert.count > -1
  )
  .map((act, index) => ({
    index,
    url: act.which.url,
    name: act.which.name,
    elementCount: act.result.statistics.totalelements,
    errorCount: act.result.categories.error.count + act.result.categories.contrast.count,
    alertCount: act.result.categories.alert.count
  }));
  // Return the relevant array.
  return relArray;
};
// Assigns ranks to pages on a criterion.
const rank = (relArray, rankName, sorter) => {
  // Sort the relevant array by the specified criterion.
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
// Scores ranked pages.
const score = (relArray, rankNames) => relArray.forEach(act => {
  act.score = rankNames.reduce((total, rankName) => total + weights[rankName] * act[rankName], 0);
});
// Creates and rcords an HTML report.
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
      content="Comparison of accessibility of web pages per the JHU-WAVE rule"
    >
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="favicon.png">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <h1>Web-page accessibility comparison</h1>
      <section class="etc wide">
        <p>The table below ranks and scores web pages on accessibility, as measured by the <dfn>JHU-WAVE rule</dfn>, the method used by the Johns Hopkins University Disability Health Research Center in producing its <a href="https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/">Vaccine Website Accessibility dashboard</a>.</p>
        <p>This table was produced with <a href="https://github.com/jrpool/autotest">Autotest</a>.</p>
        <table>
          <caption>Results of JHU-WAVE test of web pages</caption>
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
  fs.writeFile(`jhuwave-${timeStamp}.html`, page);
};
// ########## OPERATION
(async () => {
  const relArray = await distill();
  rank(relArray, 'errorRank', a => a.errorCount);
  rank(relArray, 'densityRank', a => a.errorCount / a.elementCount);
  rank(relArray, 'alertRank', a => a.alertCount);
  score(relArray, ['errorRank', 'densityRank', 'alertRank']);
  relArray.sort((a, b) => a.score - b.score);
  fs.writeFile(`jhuwave-${timeStamp}.json`, JSON.stringify(relArray, null, 2));
  webify(relArray);
})();
