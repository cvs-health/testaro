exports.commands = {
  etc: {
    button: [
      'Click a button or submit input',
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
    next: [
      'Specify the next command if the last result requires',
      {
        if: [
          true, 'array', '', 'act result property tree in a.b.c format; if to exist, also one of “<=>!” and criterion'
        ],
        jump: [false, 'number', '', 'offset of next command from this one, or 0 to stop'],
        next: [false, 'string', 'hasLength', 'name of next command'],
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
        what: [false, 'string', 'hasLength', 'comment'],
        again: [false, 'number', '', 'number of additional times to press the key']
      }
    ],
    presses: [
      'Repeatedly press a navigation key',
      {
        navKey: [true, 'string', 'hasLength', 'navigation-keyname'],
        what: [false, 'string', 'hasLength', 'tag name of element'],
        which: [false, 'array', 'areStrings', 'substrings any of which matches element text'],
        text: [false, 'string', 'hasLength', 'text to enter after reaching element'],
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
    select: [
      'Select a select option',
      {
        which: [true, 'string', 'hasLength', 'substring of select-list text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'substring of option text content']
      }
    ],
    state: [
      'Wait until the page reaches a load state',
      {
        which: [true, 'string', 'isState', '“loaded” or “idle”'],
        what: [false, 'string', 'hasLength', 'comment']
      }
    ],
    tenonRequest: [
      'Request a Tenon test',
      {
        id: [true, 'string', 'hasLength', 'ID for this test instance'],
        withNewContent: [true, 'boolean', '', 'true: use a URL; false: use page content'],
        what: [false, 'string', 'hasLength', 'comment']
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
      'Enter text into a text input, optionally with 1 placeholder for an all-caps literal environment variable',
      {
        which: [true, 'string', 'hasLength', 'substring of input text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'text to enter, with optional __PLACEHOLDER__']
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
    aatt: [
      'Perform an AATT test with HTML CodeSniffer',
      {
        waitLong: [false, 'boolean', '', 'whether to wait 12 instead of 6 seconds for a result'],
        tryLimit: [false, 'number', '', 'times to try the test before giving up; default 4']
      }
    ],
    axe: [
      'Perform an Axe test',
      {
        detailLevel: [true, 'number', '', '0 = least, 4 = most'],
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
        revealAll: [true, 'boolean', '', 'whether to make all elements visible first'],
        allowedDelay: [true, 'number', '', 'milliseconds to wait for an outline'],
        withItems: [true, 'boolean']
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
        sampleSize: [false, 'number', '', 'number of triggers to sample, if fewer than all'],
        withItems: [true, 'boolean']
      }
    ],
    ibm: [
      'Perform an IBM Equal Access test',
      {
        withItems: [true, 'boolean'],
        withNewContent: [
          false, 'boolean', '', 'true: use a URL; false: use page content; omitted: both'
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
      'Perform a menuNav test',
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
    tenon: [
      'Perform a Tenon test',
      {
        id: [true, 'string', 'hasLength', 'ID of the requested test instance']
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
