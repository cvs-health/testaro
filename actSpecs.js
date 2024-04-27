/*
  © 2021–2023 CVS Health and/or one of its affiliates. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  actSpecs
  Validator for acts of a job.
*/

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
        which: [true, 'string', 'isBrowserType', 'chromium, firefox, or webkit'],
        url: [true, 'string', 'isURL', 'initial URL to navigate to'],
        deviceID: [false, 'string', '', 'Playwright device ID if not default, e.g. iPhone 6 landscape'],
        lowMotion: [false, 'boolean', '', 'set reduced-motion option if true'],
        what: [false, 'string', 'hasLength', 'comment']
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
    test: [
      'Perform tests of a tool',
      {
        which: [true, 'string', 'isTest', 'tool name'],
        rules: [false, 'array', 'areStrings', 'rule IDs or (for nuVal) specifications, if not all']
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
        what: [true, 'string', 'isWaitable', 'waitable item type (url, title, or body)'],
        which: [true, 'string', 'hasLength', 'substring of waitable-item text']
      }
    ]
  },
  tools: {
    axe: [
      'Perform Axe tests',
      {
        detailLevel: [true, 'number', '', '0 = least, 4 = most']
      }
    ],
    ibm: [
      'Perform IBM Equal Access tests',
      {
        withItems: [true, 'boolean', '', 'itemize'],
        withNewContent: [
          true, 'boolean', '', 'true: use a URL; false: use page content (risky)'
        ]
      }
    ],
    qualWeb: [
      'Perform QualWeb tests',
      {
        withNewContent: [true, 'boolean', '', 'whether to use a URL instead of page content']
      }
    ],
    testaro: [
      'Perform Testaro tests',
      {
        withItems: [true, 'boolean', '', 'itemize'],
        stopOnFail: [true, 'boolean', '', 'whether testing is to stop after first failure'],
        args: [false, 'object', 'areArrays', 'extra args (object; property names are rule IDs and values are arrays of additional argument values ({autocomplete: [["first name", "forename", "given name"], ["last name", "surname", "family name"], ["email"]], buttonMenu: [], focInd: [false, 250], hover: [20]}) by default'],
      }
    ],
    wave: [
      'Perform WAVE tests',
      {
        reportType: [true, 'number', '', 'WAVE report type (1, 2, 3, or 4)']
      }
    ]
  }
};
