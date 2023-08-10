/* eslint-disable no-sync */
/* eslint-disable func-style */

const path = require('path');
const fs = require('fs');
const glob = require('glob-all');
const stripBom = require('strip-bom');
const shell = require('shelljs');

const rootDir = path.resolve(__dirname, '../');
const EXIT_UNCAUGHT_FATAL_EXCEPTION = 1;

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

function action() {
  const DEFAULT_LANGUAGE = 'en-us';
  const TRANSLATIONS_ASLINT_PATH = `${rootDir}/app/translations/`;

  const defaultASLintLanguageFilePath =
    `${TRANSLATIONS_ASLINT_PATH + DEFAULT_LANGUAGE}.json`;

  if (shell.test('-e', defaultASLintLanguageFilePath) === false) {
    console.error('Missing file ', defaultASLintLanguageFilePath, '\n');

    return;
  }

  let defaultLanguage = readFile(defaultASLintLanguageFilePath);

  if (isValidJSON(defaultLanguage) === false) {
    console.error(
      `[removeUnusedTranslations] Invalid JSON file for default language: ${DEFAULT_LANGUAGE}`
    );
    shell.exit(EXIT_UNCAUGHT_FATAL_EXCEPTION);
  }

  defaultLanguage = JSON.parse(defaultLanguage);

  const languageFileToSave = {};

  const defaultLanguageKeys = Object.keys(defaultLanguage);
  let contentFromAllFiles = '';

  const getFileContent = (filePath) => {
    contentFromAllFiles += readFile(filePath);
  };

  glob.sync([
    `${rootDir}/app/**/*.ts`,
    `${rootDir}/app/*.ts`
  ]).forEach(getFileContent);

  const checkForUnusedTranslationKey = (key) => {
    if (contentFromAllFiles.includes(key)) {
      languageFileToSave[key] = {
        comment: defaultLanguage[key].comment,
        value: defaultLanguage[key].value
      };
    }
  };

  defaultLanguageKeys.forEach(checkForUnusedTranslationKey);

  languageFileToSave._config = defaultLanguage._config;

  saveFile(defaultASLintLanguageFilePath, languageFileToSave);
}

action();
