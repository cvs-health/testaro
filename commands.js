exports.commands = {
  etc: {
    button: [
      'Click a button',
      {
        which: [true, 'string', 'hasLength', 'substring of button text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    checkbox: [
      'Check a checkbox',
      {
        which: [true, 'string', 'hasLength', 'substring of checkbox text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    focus: [
      'Put the specified element into focus',
      {
        what: [true, 'string', 'isFocusable', 'selector of element to be focused'],
        index: [false, 'number', '', 'index among matches if not 0'],
        which: [true, 'string', 'hasLength', 'substring of element text']
      }
    ],
    launch: [
      'Launch a Playwright browser',
      {
        which: [true, 'string', 'isBrowserType', '“chromium”, “firefox”, or “webkit”'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    link: [
      'Click a link',
      {
        which: [true, 'string', 'hasLength', 'substring of link text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    page: [
      'Switch to the last-opened browser tab',
      {
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    press: [
      'Press a key',
      {
        which: [true, 'string', 'hasLength', 'key name'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    presses: [
      'Repeatedly press a navigation key',
      {
        which: [false, 'string', 'hasLength', 'substring of destination element text if any'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'selector of destination element'],
        navKey: [true, 'string', 'hasLength', 'navigation-keyname'],
        text: [false, 'string', 'hasLength', 'text to enter after reaching destination'],
        action: [false, 'string', 'hasLength', 'name of key to press, after text entry if any'],
        withItems: [true, 'boolean']
      }
    ],
    radio: [
      'Check a radio button',
      {
        which: [true, 'string', 'hasLength', 'substring of radio-button text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    reveal: [
      'Make all elements visible',
      {
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    score: [
      'Compute and report a score',
      {
        which: [true, 'string', 'hasLength', 'score-proc name'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    select: [
      'Select a select option',
      {
        which: [true, 'string', 'hasLength', 'substring of select-list text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'substring of option text']
      }
    ],
    test: [
      'Perform a test',
      {
        which: [true, 'string', 'isTest', 'test name'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    text: [
      'Enter text into a text input',
      {
        which: [true, 'string', 'hasLength', 'substring of input text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'text to enter']
      }
    ],
    url: [
      'Navigate to a new URL',
      {
        which: [true, 'string', 'isURL', 'URL'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    wait: [
      'Wait until something appears',
      {
        what: [true, 'string', 'isWaitable', 'waitable item type'],
        which: [true, 'string', 'hasLength', 'substring of waitable-item text']
      }
    ]
  },
  tests: {
    axe: [
      'Perform an Axe test',
      {
        withItems: [true, 'boolean'],
        rules: [true, 'array', 'areStrings', 'rule names, or empty if all']
      }
    ],
    embAc: [
      'Perform an embAc test',
      {
        withItems: [true, 'boolean']
      }
    ],
    focInd: [
      'Perform a focInd test',
      {
        withItems: [true, 'boolean'],
        revealAll: [true, 'boolean', '', 'whether to make all elements visible first']
      }
    ],
    focOp: [
      'Perform a focOp test',
      {
        withItems: [true, 'boolean']
      }
    ],
    hover: [
      'Perform a hover test',
      {
        withItems: [true, 'boolean']
      }
    ],
    ibm: [
      'Perform an IBM Equal Access test',
      {
        withItems: [true, 'boolean'],
        withNewContent: [
          false, 'boolean', '', 'true: use a URL; false: use page content; omitted: use both'
        ]
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
    menuNav: [
      'Perform a tabNav test',
      {
        withItems: [true, 'boolean']
      }
    ],
    motion: [
      'Perform a motion test',
      {
        delay: [true, 'number', '', 'ms to wait before first screen shot'],
        interval: [true, 'number', '', 'ms between screen shots'],
        count: [true, 'number', '', 'count of screen shots to make']
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
    tabNav: [
      'Perform a tabNav test',
      {
        withItems: [true, 'boolean']
      }
    ],
    wave: [
      'Perform a WebAIM WAVE test',
      {
        reportType: [true, 'number', '', 'WAVE report type']
      }
    ],
    zIndex: [
      'Perform a zIndex test',
      {
        withItems: [true, 'boolean']
      }
    ]
  }
};
