exports.actSpecs = {
  etc: {
    button: [
      'Click a button or submit input',
      {
        which: [false, 'string', 'hasLength', 'substring of button text'],
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
        which: [false, 'string', 'hasLength', 'substring of element text']
      }
    ],
    launch: [
      'Launch a Playwright browser',
      {
        which: [true, 'string', 'isBrowserType', '“chromium”, “firefox”, or “webkit”'],
        what: [false, 'string', 'hasLength', 'comment'],
        lowMotion: [false, 'boolean', '', 'set reduced-motion option if true']
      }
    ],
    link: [
      'Click a link and wait for the page to be idle or loaded',
      {
        which: [false, 'string', 'hasLength', 'substring of link text'],
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
        withItems: [true, 'boolean', '', 'itemize']
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
    search: [
      'Enter text into a search input, optionally with 1 placeholder for an all-caps literal environment variable',
      {
        which: [false, 'string', 'hasLength', 'substring of input text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'text to enter, with optional __PLACEHOLDER__']
      }
    ],
    select: [
      'Select a select option',
      {
        which: [false, 'string', 'hasLength', 'substring of select-list text'],
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
        which: [false, 'string', 'hasLength', 'substring of input text'],
        index: [false, 'number', '', 'index among matches if not 0'],
        what: [true, 'string', 'hasLength', 'text to enter, with optional __PLACEHOLDER__']
      }
    ],
    url: [
      'Navigate to a new URL',
      {
        which: [true, 'string', 'isURL', 'URL (if file://, path relative to main project directory'],
        what: [false, 'string', 'hasLength', 'comment'],
        id: [false, 'string', 'hasLength', 'ID of the host']
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
    alfa: [
      'Perform an alfa test',
      {
        rules: [false, 'array', 'areStrings', 'rule names (e.g., r25), if not all']
      }
    ],
    attVal: [
      'Perform an attVal test',
      {
        attributeName: [true, 'string', 'hasLength', 'name of attribute'],
        areLicit: [true, 'boolean', '', 'whether values are licit'],
        values: [true, 'array', 'areStrings', 'values of attribute'],
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    axe: [
      'Perform an Axe test',
      {
        detailLevel: [true, 'number', '', '0 = least, 4 = most'],
        rules: [true, 'array', 'areStrings', 'rule names, or empty if all']
      }
    ],
    continuum: [
      'Perform a continuum test',
      {
        rules: [false, 'array', 'areNumbers', 'rule numbers (e.g., 25), if not all']
      }
    ],
    elements: [
      'Perform an elements test',
      {
        detailLevel: [true, 'number', '', '0 to 3, to specify the level of detail'],
        tagName: [false, 'string', 'hasLength', 'tag name (upper-case) of elements'],
        onlyVisible: [false, 'boolean', '', 'whether to exclude invisible elements'],
        attribute: [false, 'string', 'hasLength', 'required attribute selector']
      }
    ],
    embAc: [
      'Perform an embAc test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    filter: [
      'Perform a filter test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    focInd: [
      'Perform a focInd test',
      {
        revealAll: [true, 'boolean', '', 'whether to make all elements visible first'],
        allowedDelay: [true, 'number', '', 'milliseconds to wait for an outline'],
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    focOp: [
      'Perform a focOp test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    focVis: [
      'Perform a focVis test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    hover: [
      'Perform a hover test',
      {
        sampleSize: [false, 'number', '', 'limit on sample size of triggers, if any'],
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    htmlcs: [
      'Perform an htmlcs test',
      {
        rules: [
          false,
          'array',
          'areStrings',
          'rule names (e.g., Principle1.Guideline1_4.1_4_9), if not all'
        ]
      }
    ],
    ibm: [
      'Perform an IBM Equal Access test',
      {
        withItems: [true, 'boolean', '', 'itemize'],
        withNewContent: [
          false, 'boolean', '', 'true: use a URL; false: use page content; omitted: both'
        ]
      }
    ],
    labClash: [
      'Perform a labClash test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    linkTo: [
      'Perform a linkTo test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    linkUl: [
      'Perform a linkUl test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    menuNav: [
      'Perform a menuNav test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    miniText: [
      'Perform a miniText test',
      {
        withItems: [true, 'boolean', '', 'itemize']
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
    nonTable: [
      'Perform a nonTable test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    radioSet: [
      'Perform a radioSet test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    styleDiff: [
      'Perform a styleDiff test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    tabNav: [
      'Perform a tabNav test',
      {
        withItems: [true, 'boolean', '', 'itemize']
      }
    ],
    tenon: [
      'Perform a Tenon test',
      {
        id: [true, 'string', 'hasLength', 'ID of the requested test instance']
      }
    ],
    textNodes: [
      'Perform a textNodes test',
      {
        detailLevel: [true, 'number', '', '0 to 3, to specify the level of detail'],
        text: [false, 'string', 'hasLength', 'case-insensitive substring of the text node']
      }
    ],
    titledEl: [
      'Perform a titledEl test',
      {
        withItems: [true, 'boolean', '', 'itemize']
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
        withItems: [true, 'boolean', '', 'itemize']
      }
    ]
  }
};
