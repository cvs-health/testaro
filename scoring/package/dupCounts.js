/*
  dupCounts
  Processes duplications.json. That file is a copy of correlations.json, with unreal duplications
  removed by human inspection. Converts duplications.json to an object from which the count of
  duplicates of any issue type can be retrieved. Creates a file, dupCounts.json, containing the
  object.
*/
const fs = require('fs');
const compile = () => {
  const dupsJSON = fs.readFileSync('scoring/package/duplications.json', 'utf8');
  const dups = JSON.parse(dupsJSON);
  // Initialize the object.
  const data = {
    aatt: {},
    alfa: {},
    axe: {},
    ibm: {},
    wave: {}
  };
  // For each pair of packages:
  const packagePairs = Object.keys(dups);
  packagePairs.forEach(packagePair => {
    const packages = packagePair.split('_');
    // For each issue in the first package:
    dups[packagePair].forEach(issueA => {
      // Add its duplicate count to the object.
      const count = data[packages[0]][issueA] || 0;
      const issueDups = Object.keys(dups[packagePair][issueA]);
      data[packages[0]][issueA] = count + issueDups.length;
      // Add 1 for each of its duplicates to the object.
      issueDups.forEach(issueB => {
        const count = data[packages[1]][issueB] || 0;
        data[packages[1]][issueB] = count + 1;
      });
    });
  });
  return data;
};
fs.writeFileSync('scoring/package/dupCounts.json', JSON.stringify(compile(), null, 2));
