exports.parameters = (fn, sourceData, testData, scoreData, scoreProc, version, orgData) => {
  const paramData = {};
  const date = new Date();
  paramData.dateISO = date.toISOString().slice(0, 10);
  paramData.dateSlash = paramData.dateISO.replace(/-/g, '/');
  paramData.file = fn;
  paramData.scoreProc = scoreProc;
  paramData.version = version;
  paramData.org = orgData.what;
  paramData.url = orgData.which;
  paramData.axeFailures = testData.axe.result.items.map(
    item => `<li>${item.rule}: ${item.description}</li>`
  ).join('\n');
  paramData.axeScore = scoreData.axe;
  paramData.ibmFailures = Array.from(new Set(testData.ibm.result.content.items.map(
    item => `<li>${item.ruleId}: ${item.message}</li>`
  )).values()).join('\n');
  paramData.ibmScore = scoreData.ibm;
  const waveResult = testData.wave.result.categories;
  paramData.waveFailures = {
    errors: Object
    .keys(waveResult.error.items)
    .map(item => `<li>${item}: ${waveResult.error.items[item].description}</li>`)
    .join('\n'),
    contrast: Object
    .keys(waveResult.contrast.items)
    .map(item => `<li>${item}: ${waveResult.contrast.items[item].description}</li>`)
    .join('\n'),
    alert: Object
    .keys(waveResult.alert.items)
    .map(item => `<li>${item}: ${waveResult.alert.items[item].description}</li>`)
    .join('\n')
  };
  paramData.waveScore = scoreData.wave;
  paramData.bulkCount = testData.bulk.result.visibleElements;
  const embAcResult = testData.embAc.result.totals;
  paramData.embAcFailures = Object
  .keys(embAcResult)
  .map(type => `<li>${type}: ${embAcResult[type]}</li>`)
  .join('\n');
  const focAllResult = testData.focAll.result;
  paramData.focAllFailures = Object
  .keys(focAllResult)
  .map(type => `<li>${type}: ${focAllResult[type]}</li>`)
  .join('\n');
  return paramData;
};
