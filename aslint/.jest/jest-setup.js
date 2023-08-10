const langEnUs = require('../dist/translations/en-us.json');
const runnerSettings = require('../app/config/runnerSettings.json');

jest.mock('../dist/translations/en-us.json', () => ({
  default: langEnUs
}), { virtual: true });

jest.mock('../app/config/runnerSettings.json', () => ({
  default: runnerSettings
}), { virtual: true });

jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
  top: 0,
  left: 0,
  width: 1,
  height: 1
}));
