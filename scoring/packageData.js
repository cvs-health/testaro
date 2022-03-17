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
    let data = null;
    if (Array.isArray(result)) {
      data = {};
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
    }
    return data;
  },
  alfa: act => {
    const {result} = act;
    let data = null;
    if (Array.isArray(result)) {
      data = {};
      result.forEach(issue => {
        const {rule} = issue;
        if (rule) {
          const {ruleID} = rule;
          if (data[ruleID]) {
            data[ruleID]++;
          }
          else {
            data[ruleID] = 1;
          }
        }
      });
    }
    return data;
  },
  axe: act => {
    const {result} = act;
    const {items} = result;
    let data = null;
    if (items) {
      data = {};
      items.forEach(item => {
        const {rule, elements} = item;
        if (data[rule]) {
          data[rule] += elements.length;
        }
        else {
          data[rule] = elements.length;
        }
      });
    }
    return data;
  },
  ibm: act => {
    const {result} = act;
    const {content, url} = result;
    const contentViolations = content && content.totals && content.totals.violation;
    const urlViolations = url && url.totals && url.totals.violation;
    let data = null;
    if (contentViolations || urlViolations) {
      let items;
      if (contentViolations && urlViolations) {
        items = contentViolations > urlViolations ? content.items : url.items;
      }
      else {
        items = content.items || url.items;
      }
      if (items) {
        data = {};
        items.forEach(item => {
          const {ruleId, level} = item;
          const issueID = `${level[0]}:${ruleId}`;
          if (data[issueID]) {
            data[issueID]++;
          }
          else {
            data[issueID] = 1;
          }
        });
      }
    }
    return data;
  },
  wave: act => {
    const {result} = act;
    const {categories} = result;
    let data = null;
    if (categories) {
      data = {};
      const {error, contrast, alert} = categories;
      [error, contrast, alert].forEach((category, index) => {
        const {items} = category;
        Object.keys(items).forEach(ruleName => {
          const ruleID = `${'eca'[index]}:${ruleName}`;
          const {count} = items[ruleName];
          if (data[ruleID]) {
            data[ruleID] += count;
          }
          else {
            data[ruleID] = count;
          }
        });
      });
    }
    return data;
  }
};
const repo = process.argv[2];
const compile = repo => {
  const dirPath = `${__dirname}/../${repo}/reports/script`;
  const batchDirNames = fs
  .readdirSync(dirPath, {withFileTypes: true})
  .filter(dirEnt => dirEnt.isDirectory())
  .map(dirEnt => dirEnt.name)
  .filter(dirName => fs.readdirSync(`${dirPath}/${dirName}`).includes('jsonReports'));
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
fs.writeFileSync(`${__dirname}/scoring/package/data.json`, JSON.stringify(compile(repo), null, 2));
