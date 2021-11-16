exports.parameters = (fn, testData, scoreData, scoreProc, version, orgData, testDate) => {
  const htmlEscape = textOrNumber => textOrNumber
  .toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;');
  const succeedText = package => `The page passed all ${package} tests.`
  const failText = (score, package, failures) =>
    `The page received a deficit score of ${score} on ${package} because of one or more failures on:`;
  
  const paramData = {};
  const date = new Date();
  paramData.dateISO = date.toISOString().slice(0, 10);
  paramData.dateSlash = paramData.dateISO.replace(/-/g, '/');
  paramData.file = fn;
  paramData.testDate = testDate;
  paramData.scoreProc = scoreProc;
  paramData.version = version;
  paramData.org = orgData.what;
  paramData.url = orgData.which;
  const joiner = '\n        ';
  const innerJoiner = '\n            ';
  const {deficit} = scoreData;
  paramData.totalScore = deficit.total;
  paramData.axeScore = deficit.axe;
  if (deficit.axe) {
    const axeFailures = testData.axe.result.items.map(
      item => `<li>${item.rule}: ${htmlEscape(item.description)}</li>`
    ).join(joiner);
    paramData.axeResult = `${failedText('Axe', deficit.axe)}:${joiner}${axeFailures}`;
  }
  else {
    paramData.axeResult = '<strong>passed</strong> all Axe tests.';
  }
  paramData.axeFailures = testData.axe.result.items.map(
    item => `<li>${item.rule}: ${htmlEscape(item.description)}</li>`
  ).join(joiner);
  paramData.ibmFailures = Array.from(new Set(testData.ibm.result.content.items.map(
    item => `<li>${item.ruleId}: ${htmlEscape(item.message)}</li>`
  )).values()).join(joiner);
  paramData.ibmScore = deficit.ibm;
  const waveResult = testData.wave.result.categories;
  paramData.waveErrors = Object
  .keys(waveResult.error.items)
  .map(item => `<li>${item}: ${htmlEscape(waveResult.error.items[item].description)}</li>`)
  .join(innerJoiner);
  paramData.waveContrasts = Object
  .keys(waveResult.contrast.items)
  .map(item => `<li>${item}: ${htmlEscape(waveResult.contrast.items[item].description)}</li>`)
  .join(innerJoiner);
  paramData.waveAlerts = Object
  .keys(waveResult.alert.items)
  .map(item => `<li>${item}: ${htmlEscape(waveResult.alert.items[item].description)}</li>`)
  .join(innerJoiner);
  paramData.waveScore = deficit.wave;
  paramData.bulkCount = testData.bulk.result.visibleElements;
  paramData.bulkScore = deficit.bulk;
  paramData.embAcScore = deficit.embAc;
  if (paramData.embAcScore) {
    const embAcResult = testData.embAc.result.totals;
    paramData.embAcFailures = Object
    .keys(embAcResult)
    .map(type => `<li>${type}: ${embAcResult[type]}</li>`)
    .join(joiner);
  }
  else {
    paramData.embAcFailures = '';
  }
  paramData.focAllScore = deficit.focAll;
  if (paramData.focAllScore) {
    const focAllResult = testData.focAll.result;
    paramData.focAllFailures = Object
    .keys(focAllResult)
    .map(type => `<li>${type}: ${focAllResult[type]}</li>`)
    .join(joiner);
  }
  else {
    paramData.focAllFailures = '';
  }
  return paramData;
};
