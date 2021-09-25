exports.commands = {
  tests: {
    axe: [
      'Perform an Axe test (rules: rule names, or empty if all)',
      {
        withItems: [true, 'boolean'],
        rules: [true, 'array', 'areStrings']
      }
    ],
    embAc: [
      'Perform an embAc test',
      {
        withItems: [true, 'boolean']
      }
    ],
    focOl: [
      'Perform a focOl test',
      {
        withItems: [true, 'boolean'],
        revealAll: [true, 'boolean']
      }
    ],
    focOp: [
      'Perform a focOp test',
      {
        withItems: [true, 'boolean'],
        revealAll: [true, 'boolean']
      }
    ],
    hover: [
      'Perform a hover test',
      {
        withItems: [true, 'boolean']
      }
    ],
    ibm: [
      'Perform an IBM test',
      {
        withItems: [true, 'boolean'],
        withNewContent: [true, 'boolean']
      }
    ],
    labClash: [
      'Perform a labClash test',
      {
        withItems: [true, 'boolean']
      }
    ],
    linkUl: [
      'Perform a linkUl test',
      {
        withItems: [true, 'boolean']
      }
    ],
    motion: [
      'Perform a motion test',
      {
        delay: [true, 'number'],
        interval: [true, 'number'],
        count: [true, 'number']
      }
    ],
    radioSet: [
      'Perform a radioSet test',
      {
        withItems: [true, 'boolean']
      }
    ],
    roleList: [
      'Perform a roleList test',
      {
        withItems: [true, 'boolean']
      }
    ],
    styleDiff: [
      'Perform a styleDiff test',
      {
        withItems: [true, 'boolean']
      }
    ],
    wave: [
      'Perform a WAVE test',
      {
        reportType: [true, 'number']
      }
    ]
  },
  etc: {
    button: [
      'Click a button (which: substring of its text; what: description)',
      {
        which: [true, 'string', 'hasLength'],
        what: [false, 'string', 'hasLength']
      }
    ],
    checkbox: [
      'Check a checkbox (which: substring of its text; what: description)',
      {
        which: [true, 'string', 'hasLength'],
        what: [false, 'string', 'hasLength']
      }
    ],
    focus: [
      'Put the specified element into focus (what: element type; which: substring of its text)',
      {
        what: [true, 'string', 'isFocusable'],
        which: [true, 'string', 'hasLength']
      }
    ],
    launch: [
      'Launch a Playwright browser (which: chromium, firefox, or webkit; what: comment)',
      {
        which: [true, 'string', 'isBrowserType'],
        what: [false, 'string', 'hasLength']
      }
    ],
    link: [
      'Click a link (which: substring of its text; what: description)',
      {
        which: [true, 'string', 'hasLength'],
        what: [false, 'string', 'hasLength']
      }
    ],
    page: [
      'Switch to the last-opened browser tab (what: description)',
      {
        what: [false, 'string', 'hasLength']
      }
    ],
    radio: [
      'Check a radio button (which: substring of its text; what: description)',
      {
        which: [true, 'string', 'hasLength'],
        what: [false, 'string', 'hasLength']
      }
    ],
    reveal: [
      'Make all elements visible (what: description)',
      {
        what: [false, 'string', 'hasLength']
      }
    ],
    score: [
      'Compute and report a score (which: proc name; what: description)',
      {
        which: [true, 'string', 'hasLength'],
        what: [false, 'string', 'hasLength']
      }
    ],
    select: [
      'Select a select option (which: substring of list text; what: substring of option text)',
      {
        which: [true, 'string', 'hasLength'],
        what: [true, 'string', 'hasLength']
      }
    ],
    test: [
      'Perform a test (which: test name; what: description)',
      {
        which: [true, 'string', 'isTest'],
        what: [false, 'string', 'hasLength']
      }
    ],
    text: [
      'Enter text into a text input (which: substring of its text; what: text to enter)',
      {
        which: [true, 'string', 'hasLength'],
        what: [true, 'string', 'hasLength']
      }
    ],
    url: [
      'Navigate with the current page to a new URL (which: URL; what: description)',
      {
        which: [true, 'string', 'isURL'],
        what: [false, 'string', 'hasLength']
      }
    ],
    wait: [
      'Wait until something appears (what: type of thing; which: substring of its text)',
      {
        what: [true, 'string', 'isWaitable'],
        which: [true, 'string', 'hasLength']
      }
    ]
  }
};
