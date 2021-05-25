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
  .filter(act => act.type === 'waves')
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
// ########## OPERATION
const relArray = distill();
rank(relArray, 'errorRank', a => a.errorCount);
rank(relArray, 'densityRank', a => a.errorCount / a.elementCount);
rank(relArray, 'alertRank', a => a.alertCount);
score(relArray, ['errorRank', 'densityRank', 'alertRank']);
fs.writeFile(`jhuwave-${timeStamp}.json`, relArray);
