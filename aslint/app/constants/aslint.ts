export enum $aslint {
  aslint = 'aslint',
  config = 'config'
}

export enum $runnerSettings {
  asyncRunner = 'asyncRunner',
  context = 'context',
  debugMode = 'debugMode',
  description = 'description',
  direction = 'direction',
  includeElementReference = 'includeElementReference',
  includeHidden = 'includeHidden', // Note: this includes also aria-hidden="true"
  namespace = 'namespace',
  reportFormat = 'reportFormat',
  resultsCallback = 'resultsCallback',
  rules = 'rules',
  visibleUI = 'visibleUI',
  watchDomChanges = 'watchDomChanges'
}

export enum Directionality {
  ltr = 'ltr',
  rtl = 'rtl'
}

export enum ReportFormat {
  json = 'json'
}
