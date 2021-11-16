exports.parameters = (fn, testData, scoreData, scoreProc, version, orgData, testDate) => {
  const htmlEscape = textOrNumber => textOrNumber
  .toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;');
  const joiner = '\n        ';
  const innerJoiner = '\n            ';
  const succeedText = package => `<p>The page passed all ${package} tests.</p>`;
  const failText = (score, package, code, failures) =>
    `<p>The page received a deficit score of ${score} on ${package}. The details are in the <a href="../jsonReports/${fn}">JSON-format file</a>, in the section starting with <code>"which": "${code}". There was at least one failure of:</p>\n${joiner}<ul>${innerJoiner}${failures}\n${joiner}</ul>`;
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
  const {deficit} = scoreData;
  paramData.totalScore = deficit.total;
  if (deficit.axe) {
    const axeFailures = testData.axe.result.items.map(
      item => `<li>${item.rule}: ${htmlEscape(item.description)}</li>`
    ).join(innerJoiner);
    paramData.axeResult = failText(deficit.axe, 'Axe', 'axe', axeFailures);
  }
  else {
    paramData.axeResult = succeedText('Axe');
  }
  paramData.ibmScore = deficit.ibm;
  if (deficit.ibm) {
    const ibmFailures = Array.from(new Set(testData.ibm.result.content.items.map(
      item => `<li>${item.ruleId}: ${htmlEscape(item.message)}</li>`
    )).values()).join(joiner);
  }
  paramData.ibmFailures = Array.from(new Set(testData.ibm.result.content.items.map(
    item => `<li>${item.ruleId}: ${htmlEscape(item.message)}</li>`
  )).values()).join(joiner);
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
