// a11y version 5 template placeholder replacements.
exports.parameters = (fn, testData, scoreData, scoreProc, version, orgData, testDate) => {
  // Makes strings HTML-safe.
  const htmlEscape = textOrNumber => textOrNumber
  .toString()
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;');
  // Newlines with indentations.
  const joiner = '\n        ';
  const innerJoiner = '\n            ';
  // Creates messages about results of packaged tests.
  const succeedText = package => `<p>The page passed all ${package} tests.</p>`;
  const failText = (score, package, code, failures) =>
    `<p>The page received a deficit score of ${score} on ${package}. The details are in the <a href="../jsonReports/${fn}">JSON-format file</a>, in the section starting with <code>"which": "${code}". There was at least one failure of:</p>\n${joiner}<ul>${innerJoiner}${failures}\n${joiner}</ul>`;
  // Get general data for scoreDoc.
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
  // Get package-test result messages for scoreDoc.
  if (deficit.axe) {
    const axeFailures = testData.axe.result.items.map(
      item => `<li>${item.rule}: ${htmlEscape(item.description)}</li>`
    ).join(innerJoiner);
    paramData.axeResult = failText(deficit.axe, 'Axe', 'axe', axeFailures);
  }
  else {
    paramData.axeResult = succeedText('Axe');
  }
  if (deficit.ibm) {
    const ibmFailures = Array.from(new Set(testData.ibm.result.content.items.map(
      item => `<li>${item.ruleId}: ${htmlEscape(item.message)}</li>`
    )).values()).join(joiner);
    paramData.ibmResult = failText(deficit.ibm, 'Equal Access', 'ibm', ibmFailures);
  }
  else {
    paramData.ibmResult = succeedText('Equal Access');
  }
  if (deficit.wave) {
    const waveResult = testData.wave.result.categories;
    const waveItems = [];
    ['error', 'contrast', 'alert'].forEach(category => {
      waveItems.push(
        ... Object
        .entries(waveResult[category].items)
        .map(entry => `<li>${category}/${entry[0]}: ${entry[1].description}</li>`)
      );
    });
    const waveFailures = waveItems.join(joiner);
    paramData.waveResult = failText(deficit.wave, 'WAVE', 'wave', waveFailures);
  }
  else {
    paramData.waveResult = succeedText('WAVE');
  }
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
