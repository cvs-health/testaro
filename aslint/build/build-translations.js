/* eslint-disable no-sync */
/* eslint-disable func-style */
/* eslint-disable no-invalid-this */
const path = require('path');
const fs = require('fs');
const glob = require('glob-all');
const stripBom = require('strip-bom');
const shell = require('shelljs');

const rootDir = path.resolve(__dirname, '../');

const EXIT_UNCAUGHT_FATAL_EXCEPTION = 1;
const NOT_FOUND = -1;

const KEY = {
  COMMENT: 'comment',
  VALUE: 'value'
};

function isValidJSON(data) {
  let isValid = false;

  if (typeof data !== 'string') {
    return isValid;
  }

  try {
    JSON.parse(data);
    isValid = true;
  } catch (e) {
    console.error(e);
  }

  return isValid;
}

function normalizeEOL(str) {
  return str.replace(/(?:\r\n|\r|\n|[\n\u2028\u2029])/g, '\n');
}

function readFile(filePath) {
  return stripBom(fs.readFileSync(filePath, 'utf8'));
}

function saveFile(filePath, content) {
  fs.writeFileSync(filePath, normalizeEOL(JSON.stringify(content, null, 2)));
}

function removeUnusedKey(defaultLanguage, currentLanguage, key) {
  if (key === '_config') {
    return;
  }

  if (defaultLanguage.hasOwnProperty(key) === false) {
    delete currentLanguage[key];
  }
}

function updateKey(defaultLanguage, currentLanguage, key) {
  if (key === '_config') {
    return;
  }

  if (currentLanguage.hasOwnProperty(key)) {
    if (currentLanguage[key][KEY.VALUE].length === 0) {
      currentLanguage[key][KEY.VALUE] = defaultLanguage[key][KEY.VALUE];
    }
  } else {
    currentLanguage[key] = {};
    currentLanguage[key][KEY.VALUE] = defaultLanguage[key][KEY.VALUE];
  }

  if (currentLanguage[key][KEY.COMMENT] !== defaultLanguage[key][KEY.COMMENT]) {
    currentLanguage[key][KEY.COMMENT] = defaultLanguage[key][KEY.COMMENT];
  }
}

function transformKey(language, result, key) {
  if (language[key]) {
    result[key] = language[key][KEY.VALUE];
  }

  return result;
}

function action() {
  const DEFAULT_LANGUAGE = 'en-us';
  const TRANSLATIONS_ASLINT_PATH = `${rootDir}/app/translations/`;
  const TRANSLATIONS_ASLINT_DIST_PATH = `${rootDir}/dist/translations/`;
  const defaultASLintLanguageFilePath =
    `${TRANSLATIONS_ASLINT_PATH + DEFAULT_LANGUAGE}.json`;

  if (shell.test('-e', defaultASLintLanguageFilePath) === false) {
    console.error('Missing file ', defaultASLintLanguageFilePath, '\n');

    return;
  }

  if (shell.test('-e', TRANSLATIONS_ASLINT_DIST_PATH) === false) {
    shell.mkdir('-p', TRANSLATIONS_ASLINT_DIST_PATH);
    console.warn(
      'Creating missing folder ',
      TRANSLATIONS_ASLINT_DIST_PATH,
      '\n'
    );
  }

  const defaultASLintLanguage = JSON.parse(
    readFile(defaultASLintLanguageFilePath)
  );

  const aslintPaths = [
    `${TRANSLATIONS_ASLINT_PATH}*.json`,
    `!${defaultASLintLanguageFilePath}`
  ];

  function processLanguageASLint(fullPath) {
    if (fullPath.indexOf(DEFAULT_LANGUAGE) !== NOT_FOUND) {
      console.error(
        `[processLanguageASLint] Missing default language: ${DEFAULT_LANGUAGE}`
      );
      shell.exit(EXIT_UNCAUGHT_FATAL_EXCEPTION);
    }

    console.log('[processLanguageASLint]', fullPath, '\n');

    let language = readFile(fullPath);
    const filename = path.basename(fullPath);

    if (isValidJSON(language) === false) {
      console.error('Invalid language JSON structure', fullPath);
      shell.exit(EXIT_UNCAUGHT_FATAL_EXCEPTION);
    }

    language = JSON.parse(language);

    Object.keys(language).forEach(
      removeUnusedKey.bind(this, defaultASLintLanguage, language)
    );

    Object.keys(defaultASLintLanguage).forEach(
      updateKey.bind(this, defaultASLintLanguage, language)
    );

    const transformedLanguage = Object.keys(language).reduce(
      transformKey.bind(this, language),
      {}
    );

    transformedLanguage._config = language._config;

    saveFile(TRANSLATIONS_ASLINT_PATH + filename, language);
    saveFile(TRANSLATIONS_ASLINT_DIST_PATH + filename, transformedLanguage);
  }

  glob.sync(aslintPaths).forEach(processLanguageASLint);

  // CREATE DEFAULT LANGUAGE FILE WITH TRANSLATIONS
  const transformedASLintDefaultLanguage = Object.keys(
    defaultASLintLanguage
  ).reduce(transformKey.bind(null, defaultASLintLanguage), {});

  transformedASLintDefaultLanguage._config = defaultASLintLanguage._config;

  console.log('[processLanguageASLint]', defaultASLintLanguageFilePath, '\n');

  saveFile(
    `${TRANSLATIONS_ASLINT_DIST_PATH + DEFAULT_LANGUAGE}.json`,
    transformedASLintDefaultLanguage
  );

  saveFile(defaultASLintLanguageFilePath, defaultASLintLanguage);
}

action();
