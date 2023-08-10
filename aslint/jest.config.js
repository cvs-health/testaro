module.exports = {
  collectCoverageFrom: [
    'app/**/*.{js,ts}',
    '!app/**/interfaces/*.{js,ts}'
  ],
  coverageDirectory: '<rootDir>/.jest/coverage',
  maxConcurrency: require('os').cpus().length,
  moduleDirectories: [
    'node_modules'
  ],
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  modulePaths: [
    '<rootDir>'
  ],
  roots: [
    '<rootDir>'
  ],
  setupFiles: [
    '<rootDir>/.jest/jest-shim.js',
    '<rootDir>/.jest/jest-setup.js'
  ],
  setupFilesAfterEnv: [
    'jest-expect-message'
  ],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/*.test.(ts|js)'
  ],
  transform: {
    '^.+\\.(ts|js|json)?$': '<rootDir>/.jest/jest-preprocessor.js'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ]
};
