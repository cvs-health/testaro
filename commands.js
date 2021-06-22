exports.commands = {
  'axe': [
    'Perform an Axe test (which: names of rules, or empty if all; what: description)',
    {
      'which': [true, 'array', 'areStrings'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'axeS': [
    'Perform an Axe test with all rules and report only totals (what: description)',
    {
      'what': [false, 'string', 'hasLength']
    }
  ],
  'button': [
    'Click a button (which: substring of its text; what: description)',
    {
      'which': [true, 'string', 'hasLength'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'checkbox': [
    'Check a checkbox (which: substring of its text; what: description)',
    {
      'which': [true, 'string', 'hasLength'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'combo': [
    'Perform a combination of tests (which: array of reducer and test names; what: description)',
    {
      'which': [true, 'array', 'areStrings'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'focus': [
    'Put the specified element into focus (what: element type; which: substring of its text)',
    {
      'what': [true, 'string', 'isTagName'],
      'which': [true, 'string', 'hasLength']
    }
  ],
  'launch': [
    'Launch a Playwright browser (which: chromium, firefox, or webkit)',
    {
      'which': [true, 'string', 'isBrowserType']
    }
  ],
  'link': [
    'Click a link (which: substring of its text; what: description)',
    {
      'which': [true, 'string', 'hasLength'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'page': [
    'Switch to the last-opened browser tab (what: description)',
    {
      'what': [false, 'string', 'hasLength']
    }
  ],
  'radio': [
    'Check a radio button (which: substring of its text; what: description)',
    {
      'which': [true, 'string', 'hasLength'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'select': [
    'Select a select option (which: substring of list text; what: substring of option text)',
    {
      'which': [true, 'string', 'hasLength'],
      'what': [true, 'string', 'hasLength']
    }
  ],
  'test': [
    'Perform a custom test (which: test name; what: description)',
    {
      'which': [true, 'string', 'isCustomTest'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'text': [
    'Enter text into a text input (which: substring of its text; what: text to enter)',
    {
      'which': [true, 'string', 'hasLength'],
      'what': [true, 'string', 'hasLength']
    }
  ],
  'url': [
    'Navigate with the current page to a new URL (which: URL; what: description)',
    {
      'which': [true, 'string', 'isURL'],
      'what': [false, 'string', 'hasLength']
    }
  ],
  'wait': [
    'Wait until something appears (what: type of thing; which: substring of its text)',
    {
      'what': [true, 'string', 'isWaitable'],
      'which': [true, 'string', 'hasLength']
    }
  ],
  'wave1': [
    'Perform a type-1 WAVE test (which: URL if not the current; what: description)',
    {
      'which': [false, 'string', 'isURL'],
      'what': [false, 'string', 'hasLength']
    }
  ]
};
