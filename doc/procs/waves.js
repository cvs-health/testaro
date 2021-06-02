/*
  waves.js
  Comparative scores on waves.
*/
// ########## IMPORTS
// Module to access files.
const fs = require('fs').promises;
// ########## CONSTANTS
// Weights.
const weights = {
  errorCount: 6,
  errorDensity: 3,
  alertCount: 1
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
    && act.result.categories
    && act.result.statistics.totalelements > -1
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
    errorDensity:
      (act.result.categories.error.count + act.result.categories.contrast.count)
      / act.result.statistics.totalelements,
    alertCount: act.result.categories.alert.count
  }));
  // Return the relevant array.
  return relArray;
};
// Scores pages.
const score = (relArray, termNames) => relArray.forEach(act => {
  act.score = Math.floor(
    8 / 11 * termNames.reduce((total, termName) => total + weights[termName] * act[termName], 0)
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
      content="Comparison of accessibility of web pages per WAVE"
    >
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="favicon.png">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main>
      <h1>Web-page accessibility comparison</h1>
      <section class="etc wide">
        <p>The table below ranks and scores web pages on accessibility, as measured by the <dfn>Rankless JHU-WAVE rule</dfn>, derived from the JHU-WAVE rule, used by the Johns Hopkins University Disability Health Research Center in producing its <a href="https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/">Vaccine Website Accessibility dashboard</a>. This derivation reports sums of the weighted violations and densities, not weighted ranks. In generating a deficit score, this rule weighs the sum of errors and contrast errors 6, their density 3, and the count of alerts 1.</p>
        <p>This table was produced with <a href="https://github.com/jrpool/autotest">Autotest</a>.</p>
        <table>
          <caption>Results of Rankless JHU-WAVE test of web pages</caption>
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
  fs.writeFile(`waves-${timeStamp}.html`, page);
};
// ########## OPERATION
(async () => {
  const relArray = await distill();
  if (relArray.length) {
    score(relArray, [
      'errorCount',
      'errorDensity',
      'alertCount'
    ]);
    relArray.sort((a, b) => a.score - b.score);
    fs.writeFile(`axes-${timeStamp}.json`, JSON.stringify(relArray, null, 2));
    webify(relArray);
  }
  else {
    console.log('ERROR: Related array of act reports is empty');
  }
})();
