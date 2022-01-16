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
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) to perform the `ibm` test, using the IBM Equal Access Accessibility Checker
- [alfa](https://alfa.siteimprove.com/) to perform the `alfa` test, using Siteimprove alfa
- [Automated Accessibility Testing Tool](https://www.npmjs.com/package/aatt) to perform the `aatt` test, using HTML CodeSniffer
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) to perform the `axe` test, using `axe-core`
- [KickFire Company Name to Website Endpoint](https://www.kickfire.com/developers/docs-page.php#item-3-6) to convert organization names to URLs
- [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion
- [WAVE API](https://wave.webaim.org/api/) to perform the `wave' test, using WAVE

Autotest enables federated accessibility testing by combining test packages and supplementing them with additional tests. As of January 2022, the counts of tests in the packages referenced above were:
- `aatt`: 98
- `alfa`: 103
- `axe`: 138
- `ibm` 163
- `wave`: 110
- total: 612

## Code organization

Some of the files of code are located at the root of the project directory.

The main subdirectories of the project directory containing other code files are:
- `tests`: files containing the code defining particular tests
- `procs`: shared procedures
- `validation`: code and artifacts for the validation of tests

Autotest assumes that you also have code in another directory. There you may name the main subdirectories as you wish, such as:
- `scripts`: instructions for conducting tests
- `batches`: collections of URLs to be tested by a single script
- `reports`: reports of the results of tests
- `data`: data for use by procedures

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
BATCHDIR=[4]
REPORTDIR=[5]
DATADIR=[6]
```

Replace the bracketed numbers above with the applicable values, such as:

```bash
SCRIPTDIR=../my-autotest/scripts
```

You are responsible for obtaining keys to use WAVE or Kickfire if you wish to use them within Autotest. (See the links above under “Technologies”.)

## Specification

Before using Autotest, you must specify what it should do. You do this by creating at least one script, and optionally one or more batches.

## Validation

In order to validate Autotest tests, you will use a validation script in the `validation/scripts` directory, plus artifacts (HTML documents) in a subdirectory of the `validation/targets` directory. For any validation script named `foo.json`, there must be a subdirectory named `validation/targets/foo`. For several of the tests in Autotest, validation scripts and targets already exist, and you can use them as-is. They are named after the tests that they validate.

### Scripts

#### Introduction

Autotest, whether you test with it or validate its tests, performs the **commands** in a **script**. When you run Autotest, you first tell it which mode you want (running or validating). Then it lists the available scripts for the mode you chose and asks you which script you want it to execute.

A script is a JSON file with the properties:

```json
{
  "what": "string: description of the script",
  "strict": "boolean: whether redirections should be treated as failures",
  "commands": "array of objects: the commands to be performed"
}
```

#### Example

Here is an example of a script:

```json
{
  "what": "Test example.com with alfa",
  "strict": true,
  "commands": [
    {
      "type": "launch",
      "which": "chromium",
      "what": "Chromium browser"
    },
    {
      "type": "url",
      "which": "https://example.com/",
      "what": "page with a few accessibility defects"
    },
    {
      "type": "test",
      "which": "alfa",
      "what": "Siteimprove alfa package"
    }
  ]
}
```

This script tells Autotest to open a page in the Chromium browser, navigate to `example.com`, and perform the tests in the `alfa` package on that URL. Autotest will output a report in your browser window and save a copy of the report as a file.

#### Strictness

If the `strict` property is `true`, Autotest will accept redirections that add or subtract a final slash, but otherwise will treat redirections as failures.

#### Commands

##### Commands in general

The `commands` property’s value is an array of commands, each formatted as an object.

Each command has a `type` property and optionally has a `name` property. It must or may have other properties, depending on the value of `type`.

You can look up the command types and their required and optional properties in the `commands.js` file. That file defines two objects, named `etc` and `tests`.

The properties of the `etc` object specify what is required for commands to be valid. Here is one example of a command:

```json
{
  "type": "link",
  "which": "warming",
  "what": "article on climate change"
}
```

And here is the applicable property of the `etc` object:

```js
link: [
  'Click a link (which: substring of its text; what: description)',
  {
    which: [true, 'string', 'hasLength'],
    what: [false, 'string', 'hasLength']
  }
]
```

As this example illustrates, to find the requirements for a `link`-type command, you look up the `link` property of the `etc` object. Its value is an array with two elements: a string describing the command and an object containing requirements.

A requirement, such as `which: [true, 'string', 'hasLength']`, has a property key as its key. In this case, it specifies what is required for the `which` property of a `link`-type command. The requirement takes the form of an array:
- 0. Is the property (here `which`) required (`true` or `false`)?
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, or `'number'`)?
- 2. What other validity criterion applies (if any)? (Omitted if none.)

That other validity criterion may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': is a string starting with `http`, `https`, or `file`, then `://`, then ending with 1 or more non-whitespace characters
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isState'`: is `'loaded'` or `'idle'`
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

Thus, each `test`-type command must have a `which` property and may have a `what` property. (As stated above, it may also have a `name` property.)

The `commands.js` file also has a `tests` object. Its properties provide additional validity requirements for some tests. For example, one property of `tests` is:

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

This property says that any `motion`-type test must, in addition to the required and optional properties of all tests, also have `delay`, `interval`, and `count` properties with number values.

The meanings of the extra properties of test commands are stated, in parentheses, in the first element of the array, except for two properties:
- `withItems`. The `true` or `false` value of `withItems`, in any test requiring it, specifies whether the report of the results of the test should itemize the successes and failures.
- `expect`. Any command that will validate a test must contain an `expect` property. The value of that property states an array of expected results. If an `expect` property is present in a `test` command, the report will tabulate and identify the expectations that are fulfilled or are violated by the results. For example, a `test` command might have this `expect` property:

```json
"expect": [
  ["total.links", "=", 5],
  ["total.links.underlined", "=", 2],
  ["total.links.outlined"]
]
```

That would state the expectation that the `result` property of the report will have a `total.links` property with the value 5, a `total.links.underlined` property with the value 2, and **no** `total.links.outlined` property.

##### Command sequence

The first two commands in any script have the types `launch` and `url`, respectively, as shown in the example above. They launch a browser and then use it to visit a URL. For example:

```json
{
  "type": "launch",
  "which": "chromium",
  "what": "Open a page in a Chromium browser"
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
- navigations (browser launches, visits to URLs, waits for page conditions, etc.)
- alterations (changes to the page)
- tests (whether in dependency packages or defined within Autotest)
- scoring (aggregating test results into total scores)
- branching (continuing from a command other than the next one)

An example of a **move** is:

```json
{
  "type": "radio",
  "which": "No",
  "index": 2,
  "what": "No, I am not a smoker"
}
```

In this case, Autotest checks the third radio button whose text includes the string “No” (case-insensitively).

In identifying the target element for a move, Autotest matches the `which` property with the texts of the elements of the applicable type (such as radio buttons). It defines the text of an `input` element as the concatenated texts of its implicit label or explicit labels, if any, plus, for the first input in a `fieldset` element, the text content of the `legend` element of that `fieldset` element. For any other element, Autotest defines the text as the text content of the element.

When multiple elements of the same type have indistinguishable texts, you can include an `index` property to specify the index of the target element, among all those that will match.

An example of a **navigation** is the command of type `url` above. Another is:

```json
{
  "type": "wait",
  "which": "travel",
  "what": "title"
}
```

In this case, Autotest waits until the page title contains the string “travel” (case-insensitively).

An example of an **alteration** is:

```json
{
  "type": "reveal",
  "what": "make everything visible"
}
```

This command causes Autotest to alter the `display` and `visibility` style properties of all elements, where necessary, so those properties do not make any element invisible.

An example of a **packaged test** is:

```json
{
  "type": "test",
  "which": "wave",
  "reportType": 1,
  "what": "WAVE summary"
}
```

In this case, Autosest runs the WAVE test with report type 1.

An example of an **Autotest-defined** test is:

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

An example of a **scoring** command is:

```json
{
  "type": "score",
  "which": "asp09",
  "what": "5 packages and 16 custom tests, with duplication discounts"
}
```

In this case, Autotest executes the procedure specified in the `a11y05` score proc (in the `procs/score` directory) to compute a total score for the script. The proc is a JavaScript module whose `scorer` function returns an object containing a total score and the itemized scores that yield the total.

The `scorer` function inspects the script report to find the required data, applies specific weights and formulas to yield the itemized scores, and combines the itemized scores to yield the total score.

The data for scores can include not only test results, but also log statistics. Autotest includes in each report the properties:
- `logCount`: how many log items the browser generated
- `logSize`: how large the log items were in the aggregate, in characters
- `prohibitedCount`: how many log items contain (case-insensitively) `403` and `status`, or `prohibited`
- `visitTimeoutCount`: how many times an attempt to visit a URL timed out
- `visitRejectionCount`: how many times a URL visit got an HTTP status other than 200 or 304

An example of a **branching** command is:

```json
{
  "type": "next",
  "if": ["totals.invalid", ">", 0],
  "jump": -4,
  "what": "redo search if any invalid elements"
}
```

This command checks the result of the previous act to determine whether its `result.totals.invalid` property has a positive value. If so, it changes the next command to be performed, specifying the command 4 commands before this one.

A `next`-type command can use a `next` property instead of a `jump` property. The value of the `next` property is a command name. It tells Autotest to continue performing commands starting with the command having that value as the value of its `name` property.

##### URL commands

Once you have included a `url` command in a script, you do not need to add more `url` commands unless you want the browser to visit a different URL.

However, some tests modify web pages. In those cases, Autotest performs additional `url` commands after those tests, to ensure that changes made by one test do not affect subsequent acts. Those additional `url` acts appear in the report, but their commands are not inserted into your script.

### Batches

There are two ways to use a script in run mode to give instructions to Autotest:
- The script can be the complete specification of the job.
- The script can specify the operations to perform, and a _batch_ can specify which pages to perform them on.

A batch is a JSON file with this format:

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

When you combine a script with a batch, Autotest performs the script, replacing the `which` and `what` properties of all `url` commands with the values in the first object in the `hosts` array, then again with the values in the second object, and so on. Those replacements also occur in the inserted extra `url` commands mentioned above.

A batch offers an efficient way to perform a uniform set of commands on every host in a set of hosts. In this way you can run the same set of tests on multiple web pages. Autotest writes a separate report file for each host.

A no-batch script offers a way to carry out a complex operation, which can include navigating from one host to another, which is not possible with a batch. Any `url` commands are performed as-is, without changing their URLs.

## Execution

Open a command shell (a terminal), navigate to the Autotest directory, and enter `node index`. That starts Autotest’s server, which listens for requests on port 3000 of `localhost`.

To make requests to Autotest, visit `localhost:3000/autotest` with a web browser and follow the instructions displayed by Autotest.

Autotest outputs a report to your browser window, or a progress report if you are using a batch with two or more hosts. It also writes files:
   - a report file for the script, or one report file per URL if there was a batch
   - image files if necessary for exhibits in reports (i.e. if the images cannot be linked to)
   - image files from screenshots made in the `motion` test
   - temporary files required by some tests

When you have finished using Autotest, you stop it by entering <kbd>CTRL-c</kbd>.

## Contribution

You can define additional Autotest commands and functionality. Contributions are welcome.

## Accessibility principles

Autotest allows other tests to be defined, which can detect accessibility properties not discovered by any of the packages.

The rationales motivating tests can be found in comments within the files of those tests, in the `tests` directory.

### Future work

Further development is contemplated, is taking place, or is welcomed, on:
- links with href="#"
- links and buttons styled non-distinguishably
- first focused element not first focusable element in DOM
- never-visible skip links
- buttons with no text content
- modal dialogs
- autocomplete attributes

Additional test packages may be integratable into Autotest. The [`bbc-a11y`](https://github.com/bbc/bbc-a11y) package has been considered, but it has not been updated since 2018 and has vulnerable dependencies.

## Testing challenges

### Activation

Testing to determine what happens when a control or link is activated is straightforward, except in the context of a comprehensive set of tests of a single page. There, activating a control or link can change the page or navigate away from it, interfering with the remaining planned tests of the page.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

### Test-package duplication

Test packages sometimes do redundant testing, in that two or more packages test for the same issues. But the testing and reporting are not necessarily identical.

To compensate for test-package duplication, scoring procs can adjust the weights they apply to particular findings of test packages.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## More information

The `doc` directory may contain additional information.
