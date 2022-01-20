/*
  packageData
  Compiles data on the per-URL distributions of issues in package tests.
  Arguments:
    0. Name of sibling repo containing reports/script directory.
*/
const fs = require('fs');
const compilers = {
  aatt: act => {
    const {result} = act;
    const data = {};
    result.forEach(issue => {
      const {type, id} = issue;
      if (type && id) {
        const typeID = `${type[0]}:${id}`;
        if (data[typeID]) {
          data[typeID]++;
        }
        else {
          data[typeID] = 1;
        }
      }
    });
    return data;
  }
};
const repo = process.argv[2];
const compile = repo => {
  const dirPath = `../${repo}/reports/script`;
  const batchDirNames = fs
  .readdirSync(dirPath, {withFileTypes: true})
  .filter(dirEnt => dirEnt.isDirectory())
  .map(dirEnt => dirEnt.name)
  .filter(dirName => fs.readdirSync(`${dirPath}/${dirName}`)).includes('jsonReports');
  const data = {};
  batchDirNames.forEach(batchDirName => {
    const reportNames = fs.readdirSync(`${dirPath}/${batchDirName}/jsonReports`);
    reportNames.forEach(reportName => {
      const reportJSON = fs.readFileSync(`${dirPath}/${batchDirName}/jsonReports/${reportName}`);
      const report = JSON.parse(reportJSON);
      const {acts} = report;
      const urlAct = acts.find(act => act.type === 'url');
      if (urlAct) {
        const url = urlAct.result;
        if (! data[url]) {
          data[url] = {
            aatt: {},
            alfa: {},
            axe: {},
            ibm: {},
            wave: {}
          };
        }
        const testActs = acts.filter(act => act.type === 'test');
        testActs.forEach(testAct => {
          if (testAct.which === 'aatt') {
            data[url].aatt = compilers.aatt(testAct);
          }
          else if (testAct.which === 'alfa') {
            data[url].alfa = compilers.alfa(testAct);
          }
          else if (testAct.which === 'axe') {
            data[url].axe = compilers.axe(testAct);
          }
          else if (testAct.which === 'ibm') {
            data[url].ibm = compilers.ibm(testAct);
          }
          else if (testAct.which === 'wave') {
            data[url].wave = compilers.wave(testAct);
          }
        });
      }
    });
  });
  return data;
};
fs.writeFileSync('scoring/package/data.json', JSON.stringify(compile(repo), null, 2));
