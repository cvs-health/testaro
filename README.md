# autotest

Accessibility test automation

## Summary

Autotest is a prototype application investigating methods of web-application test automation, with an emphasis on tests for accessibility. Autotest performs automated tests on web documents.

## System requirements

Version 14 or later of [Node.js](https://nodejs.org/en/).

## Technologies

Autotest uses the [dotenv](https://www.npmjs.com/package/dotenv) package to keep secrets and personalize form completion.

Autotest uses `Node.js` to run:
- an `HTTP(S)` server to interact with you
- an `HTTP(S)` client to interact with websites

Autotest uses the [Playwright](https://playwright.dev/) package to launch browsers, perform user actions in them, and perform tests.

Autotest uses:
- [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) to test with the `axe-core` ruleset
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) to test with the IBM Equal Access Accessibility Checker
- [WAVE API](https://wave.webaim.org/api/) to test with WAVE
- [KickFire Company Name to Website Endpoint](https://www.kickfire.com/developers/docs-page.php#item-3-6) to convert organization names to URLs

## Code organization

Several files of HTML, CSS, JavaScript, and JSON are located in the project directory.

Two main subdirectories of the project directory contain code files:
- `procs` contains shared procedures.
- `tests` contains the code for individual tests.

## Installation

```bash
git clone autotest
cd autotest
npm install
```

## Configuration

Create a file named `.env` in the project directory, with this content:

```bash
HOST=localhost:3000
PROTOCOL=http
WAVE_KEY=[1]
KICKFIRE_KEY=[2]
SCRIPTDIR=[3]
REPORTDIR=[4]
BATCHDIR=[5]
DATADIR=[6]
```

Replace the bracketed numbers above with the applicable values, such as:

```bash
SCRIPTDIR=../my-autotest/scripts
```

In this example, your script directory would be a subdirectory of a `my-autotest` directory, which would be a sibling of the `autotest` project directory.

## Specification

Before running Autotest, you must specify what it should do. You do this by creating at least one script, and optionally one or more batches.

### Scripts

#### Introduction

Autotest performs the **commands** in a **script**. When you run Autotest, it lists your scripts and asks you which one it should execute.

A script is a JSON file with 2 properties:

```json
{
  "what": "Description of the script",
  "commands": []
}
```

#### Commands

##### Commands in general

The `commands` property’s value is an array of commands.

Each command has a `type` property and other properties specifying the command.

You can look up the command types and their required and optional properties in the `commands.js` file. That file defines two objects, named `tests` and `etc`.

The properties of the `etc` object specify the validity requirements for the possible command types. Here is one example:

```js
link: [
  'Click a link (which: substring of its text; what: description)',
  {
    which: [true, 'string', 'hasLength'],
    what: [false, 'string', 'hasLength']
  }
]
```

As this example illustrates, an `etc` property has a `type` value as its key. Here, the type is `link`. The value is an array with two elements: a string describing the command and an object containing property requirements.

A property requirement, such as `which: [true, 'string', 'hasLength']`, has a property key as its key and an array of requirement elements as its value. The requirement elements are:
- 0. Is the property required (`true` or `false`)?
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, or `'number'`)?
- 2. What other validity criterion applies (if any)?

That other validity criterion may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': has the format of a URL
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isTest'`: is the name of a test
- `'isWaitable'`: is `'url'`, `'title'`, or `'body'`
- `'areStrings'`: is an array of strings

##### Test commands

Commands of type `test` may have additional validity requirements. They must always conform to the `test` object in `etc`, namely:

```js
test: [
  'Perform a test (which: test name; what: description)',
  {
    which: [true, 'string', 'isTest'],
    what: [false, 'string', 'hasLength']
  }
]
```

If the `tests` object of `commands.js` includes a test type, then any test of that type must also conform to the requirements given there. For example, one property of `tests` is:

```js
motion: [
  'Perform a motion test (delay: ms until start; interval: ms between; count: of screenshots)',
  {
    delay: [true, 'number'],
    interval: [true, 'number'],
    count: [true, 'number']
  }
]
```

Therefore, any `motion` test must have a `which` property and may have a `what` property, and moreover must have `delay`, `interval`, and `count` properties.

The meanings of the extra properties of test commands are stated in the first element of the array, except for the `withItems` property. The `true` or `false` value of that property, in any test requiring it, specifies whether the report of the results of the test should itemize the successes and failures.

##### Command sequence

The first two commands have the types `launch` and `url`, respectively. They launch a browser and then use it to visit a URL. For example:

```json
{
  "type": "launch",
  "which": "chromium",
  "what": "Launch a chromium browser"
}
```

```json
{
  "type": "url",
  "which": "https://en.wikipedia.org/wiki/Main_Page",
  "what": "English Wikipedia home page"
}
```

##### Command types

The subsequent commands can tell Autotest to perform any of:
- moves (clicks, text inputs, hovers, etc.)
- navigations (browser launches, visits to other URLs, waits for page conditions, etc.)
- tests (imported from packages or created by Autotest)
- scoring (aggregating test results into total scores)

An example of a move is:

```json
{
  "type": "button",
  "which": "Close",
  "what": "close the modal dialog"
}
```

In this case, Autotest clicks the first button whose text content includes the string “Close” (case-insensitively).

An example of a navigation is the command of type `url` above. Another is:

```json
{
  "type": "wait",
  "which": "travel",
  "what": "title"
}
```

In this case, Autotest waits until the page title contains the string “travel” (case-insensitively).

An example of a packaged test is:

```json
{
  "type": "test",
  "which": "wave",
  "reportType": 1,
  "what": "WAVE summary"
}
```

In this case, Autosest runs the WAVE test with report type 1.

An example of an Autotest-provided test is:

```json
{
  "type": "test",
  "which": "motion",
  "delay": 1500,
  "interval": 2000,
  "count": 5,
  "what": "test for motion on the page"
}
```

In this case, Autotest runs the `motion` test with the specified parameters.

Near the top of the `index.js` file is an object named `tests`. It describes all available tests.

An example of a scoring command is:

```json
{
  "type": "score",
  "which": "p03c13",
  "what": "3 packages and 13 custom tests, with duplication discounts"
}
```

In this case, Autotest executes the procedure specified in the `p03c13` score proc to compute a total score for the script. The proc is a JavaScript module whose `scorer` function returns an object containing a total score and the itemized scores that yield the total.

The `scorer` function inspects the script report to find the required data, applies specific weights and formulas to yield the itemized scores, and combines the itemized scores to yield the total score.

The data for scores can include not only test results, but also log statistics. Autotest includes in each report a total count of log items and an aggregate count of the characters in all the log messages for the script. A score proc can use them in computing a total score.

### Batches

A script can be the complete specification of an Autotest job.

However, if you want to perform the same set of commands repeatedly, changing only the URL from one run to another, you can combine a script with a **batch**. A batch is a JSON file with this format:

```json
{
  "what": "Accessibility standards",
  "hosts": [
    {
      "which": "https://www.w3.org/TR/WCAG21/",
      "what": "WCAG 2.1"
    },
    {
      "which": "https://www.w3.org/WAI/standards-guidelines/aria/",
      "what": "W3C WAI-ARIA"
    }
  ]
}
```

When you combine a script with a batch, Autotest performs the script, replacing the `which` and `what` properties of all `url` commands with the values in the first object in the `hosts` array, then again with the values in the second object, and so on.

A batch offers an efficient way to perform a uniform set of commands on every host in a set of hosts. Running the same set of tests on multiple web pages is an example. Autotest writes a report file for each host.

A no-batch script offers a way to carry out a complex operation, which can include navigating from one host to another, which is not possible with a batch.

## Execution

Open a command shell (a terminal), navigate to the Autotest directory, and enter `node index`. That starts Autotest’s server, which listens for requests on port 3000 of `localhost`.

To make requests to Autotest, visit `localhost:3000/autotest` with a web browser and follow the instructions displayed by Autotest.

Autotest outputs a report to your browser window, or a progress report if you are using a batch with two or more hosts. It also writes files into the project directory:
   - a report file for the script, or one report file per URL if there was a batch
   - image files if necessary for exhibits in reports (i.e. if the images cannot be linked to)
   - image files from screenshots made in tests for motion
   - temporary files required by some tests

When you have finished using Autotest, you stop it by entering <kbd>CTRL-c</kbd>.

## Other features

### Future work

Other custom tests on which further development is contemplated or is taking place include:
- links with href="#"
- links and buttons styled non-distinguishably
- first focused element not first focusable element in DOM
- skip link that is never visible
- button with no text content

## Testing obstacles

### Operability

No method for the comprehensive testing of element operability has been found yet. Such a test would report whether clicking the location of any particular element would dispatch any event.

Ideally, such a test would not require actually clicking the element location, because doing so could change the page and/or its URL, thereby preventing the conduct of tests on any not-yet-tested elements. But no method is known for such a test.

Tests that perform clicks on elements appear difficult to diagnose. No method has been found for determining whether such a click dispatches an event or whether code is executed in the browser immediately after such a click. One experiment was able to distinguish an operable element from an inoperable element by setting the timeout on an `elementHandle.click()` method to 37 milliseconds. At 35 milliseconds, the method did not return within the timeout on any element. At 40 milliseconds, it returned within the timeout on all elements. But at 37 milliseconds it returned within the timeout on inoperable elements but not on an operable element. However, it seems reasonable to assume that the threshold timeout depends on the event(s) dispatched by a click and there is therefore no uniform timeout distinguishing operable from inoperable elements.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

The `markOperable` test proc and the `focOp` test that uses it therefore approximate operability testing, but do not test definitively for operability.

### Test-package integrations

Autotest integrate three accessibility test packages: [Axe](https://github.com/dequelabs/axe-core), [IBM Equal Access Accessibility Checker](https://github.com/IBMa/equal-access), and [WAVE](https://wave.webaim.org/). The rules governing their commands in scripts are described above.

#### Axe

Axe integration depends on the [axe-playwright](https://www.npmjs.com/package/axe-playwright) package. Violations reported with that package exclude <dfn>incomplete</dfn> (also called <q>needs-review</q>) violations and violations of <q>experimental</q> rules.

#### WAVE

WAVE integration depends on the user having a WAVE API key. Use of the WAVE API depletes the user’s WAVE API credits. The `wave1`, `wave2`, and `wave4` commands perform WAVE tests with respective `reporttype` values on a specified URL. Such a test costs 1, 2, or 3 credits, respectively ($0.04 per credit, or less in quantity). When you register with WebAIM and obtain a WAVE API key, you must add a line to your `.env` file, in the format `WAVE_KEY=x0x0x0x0x0x0x` (where `x0x0x0x0x0x0x` represents your key).

#### Test-package duplication

Test packages sometimes do redundant testing, in that two or more packages test for the same issues. The testing and reporting are not necessarily identical.

For example, when a `button` is empty and unlabeled, or an `input` is unlabeled, Axe reports a <q>critical</q> violation and WAVE reports an <q>error</q>. However, when a `select` is unlabeled, Axe reports a <q>critical</q> violation and WAVE reports only an <q>alert</q>. When a form control has an explicit label (a `label` element referencing the control with a `for` attribute), but that label is nullified by a higher-precedence label (an `aria-label` or `aria-labelledby` attribute), WAVE reports an <q>alert</q>, but Axe does not report any issue.

To compensate for test-package duplication, scoring procs can adjust the weights they apply to particular findings of test packages.

#### Omitted test packages

Other test packages that may be integrated into Autotest in the future include:
- `bbc-a11y` (not updated since 2018; has vulnerable dependencies)
- `html codesniffer`

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## More information

The `doc` directory contains additional information, including some examples of scripts.
