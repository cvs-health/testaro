# testaro

Accessibility test automation

## Summary

Testaro is a collection of web accessibility tests.

The purpose of Testaro is to provide programmatic access to over 600 accessibility tests defined in several test packages and in Testaro itself.

Running Testaro requires telling it which operations (including tests) to perform and which URLs to perform them on, and giving Testaro an object to put its output into.

Testaro outputs progress messages to the standard output. It populates the object with log information and test reports.

## System requirements

Version 14 or later of [Node.js](https://nodejs.org/en/).

A file system with a directory that the Testaro user has permission to read and write in.

## Dependencies

Testaro uses:
- [Playwright](https://playwright.dev/) to launch browsers, perform user actions in them, and perform tests
- [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion

Testaro includes some of its own accessibility tests. In addition, it performs the tests in:
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) (the IBM Equal Access Accessibility Checker)
- [alfa](https://alfa.siteimprove.com/) (Siteimprove alfa)
- [Automated Accessibility Testing Tool](https://www.npmjs.com/package/aatt) (Paypal AATT, running HTML CodeSniffer)
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) (Deque Axe-core)
- [WAVE API](https://wave.webaim.org/api/) (WebAIM WAVE)

As of this version, the counts of tests in the packages referenced above were:
- AATT: 98
- Alfa: 103
- Axe-core: 138
- Equal Access: 163
- WAVE: 110
- subtotal: 612
- Testaro tests: 15
- grand total: 627

## Code organization

The main directories containing code files are:
- package root: main code files
- `tests`: files containing the code defining particular tests
- `procs`: shared procedures
- `validation`: code and artifacts for the validation of Testaro

## Installation

Some of the dependencies of Testaro are published as Github packages. Installing Testaro therefore requires you to be authorized to read Github packages. If you do not yet have that authorization, you can give it to yourself as follows:
- Log in at [Github](https://github.com).
- From your avatar in the upper-right corner, choose “Settings”.
- In the left sidebar, choose “Developer settings”.
- In the left sidebar, choose “Personal access tokens”.
- Activate the button “Generate new token”.
- Give the new token a descriptive note.
- Select an expiration date.
- Check the checkbox `read:packages`.
- Activate the button “Generate token”.
- Copy the generated token (you can use the copy icon next to it).
- In the local directory of the project into which you will install Testaro, create a file named `.npmrc`, unless it already exists.
- Populate the `.npmrc` file with the following statements, replacing `abc` with your Github username and `xyz` with the token that you copied:

    ```bash
    @siteimprove:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:username=abc
    //npm.pkg.github.com/:_authToken=xyz
    ```
Once you have done that, you can install Testaro as you would install any `npm` package.

## Payment

All of the tests that Testaro can perform are free of cost, except those in the WAVE package. WebAIM requires an API key for those tests. If you wish to have Testaro perform the WAVE tests, you will need to have a WAVE API key. Visit the URL above in order to obtain your key. It costs 1 to 3 credits to perform the WAVE tests on one URL. WebAIM gives you 100 credits without cost, before you need to begin paying.

## Specification

To use Testaro, you must specify what it should do. You do this with a script and optionally a batch.

## Scripts

### Introduction

When you run Testaro, you provide a **script** to it. The script contains **commands**. Testaro performs those commands.

A script is a JSON file with the properties:

```json
{
  "what": "string: description of the script",
  "strict": "boolean: whether redirections should be treated as failures",
  "commands": "array of objects: the commands to be performed"
}
```

### Example

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

This script tells Testaro to open a page in the Chromium browser, navigate to `example.com`, and perform the tests in the `alfa` package on that URL.

### Strictness

If the `strict` property is `true`, Testaro will accept redirections that add or subtract a final slash, but otherwise will treat redirections as failures.

### Commands

#### Introduction

The `commands` property’s value is an array of command objects.

Each command has a `type` property and optionally has a `name` property (used in branching, described below). It must or may have other properties, depending on the value of `type`.

#### Command sequence

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

#### Command types

The subsequent commands can tell Testaro to perform any of:
- moves (clicks, text inputs, hovers, etc.)
- navigations (browser launches, visits to URLs, waits for page conditions, etc.)
- alterations (changes to the page)
- tests (whether in dependency packages or defined within Testaro)
- scoring (aggregating test results into total scores)
- branching (continuing from a command other than the next one)

##### Moves

An example of a **move** is:

```json
{
  "type": "radio",
  "which": "No",
  "index": 2,
  "what": "No, I am not a smoker"
}
```

In this case, Testaro checks the third radio button whose text includes the string “No” (case-insensitively).

In identifying the target element for a move, Testaro matches the `which` property with the texts of the elements of the applicable type (such as radio buttons). It defines the text of an `input` element as the concatenated texts of its implicit label or explicit labels, if any, plus, for the first input in a `fieldset` element, the text content of the `legend` element of that `fieldset` element. For any other element, Testaro defines the text as the text content of the element.

When multiple elements of the same type have indistinguishable texts, you can include an `index` property to specify the index of the target element, among all those that will match.

##### Navigations

An example of a **navigation** is the command of type `url` above.

Once you have included a `url` command in a script, you do not need to add more `url` commands unless you want the browser to visit a different URL.

However, some tests modify web pages. In those cases, Testaro inserts additional `url` commands into the `script` property of the `options` object, after those tests, to ensure that changes made by one test do not affect subsequent acts.

Another navigation example is:

```json
{
  "type": "wait",
  "which": "travel",
  "what": "title"
}
```

In this case, Testaro waits until the page title contains the string “travel” (case-insensitively).

##### Alterations

An example of an **alteration** is:

```json
{
  "type": "reveal",
  "what": "make everything visible"
}
```

This command causes Testaro to alter the `display` and `visibility` style properties of all elements, where necessary, so those properties do not make any element invisible.

##### Tests

###### Introduction

The possible commands of type `test` are enumerated in the `tests` object defined in the `index.js` file.

###### Examples

An example of a **packaged test** is:

```json
{
  "type": "test",
  "which": "wave",
  "reportType": 1,
  "what": "WAVE summary"
}
```

In this case, Testaro runs the WAVE test with report type 1.

An example of a **Testaro-defined** test is:

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

In this case, Testaro runs the `motion` test with the specified parameters.

##### Scoring

An example of a **scoring** command is:

```json
{
  "type": "score",
  "which": "asp09",
  "what": "5 packages and 16 custom tests, with duplication discounts"
}
```

In this case, Testaro executes the procedure specified in the `asp09` score proc (in the `procs/score` directory) to compute a total score for the script or (if there is a batch) the host. The proc is a JavaScript module whose `scorer` function returns an object containing a total score and the itemized scores that yield the total.

The `scorer` function inspects the script report to find the required data, applies specific weights and formulas to yield the itemized scores, and combines the itemized scores to yield the total score.

The data for scores can include not only test results, but also log statistics. Testaro includes in each report the properties:
- `logCount`: how many log items the browser generated
- `logSize`: how large the log items were in the aggregate, in characters
- `prohibitedCount`: how many log items contain (case-insensitively) `403` and `status`, or `prohibited`
- `visitTimeoutCount`: how many times an attempt to visit a URL timed out
- `visitRejectionCount`: how many times a URL visit got an HTTP status other than 200 or 304

A good score proc takes account of duplications between test packages: two or more packages that discover the same accessibility defects. Score procs can apply discounts to reflect duplications between test packages, so that, if two or more packages discover the same defect, the defect will not be overweighted.

The procedures in the `scoring` directory have produced data there that score procs can use for the calibration of discounts.

Some documents are implemented in such a way that some tests are prevented from being conducted on them. When that occurs, the score proc can **infer** a score for that test.

##### Branching

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

A `next`-type command can use a `next` property instead of a `jump` property. The value of the `next` property is a command name. It tells Testaro to continue performing commands starting with the command having that value as the value of its `name` property.

#### Commands file

##### Introduction

The `commands.js` file contains rules governing commands. The rules determine whether a command is valid.

##### Rule format

The rules in `commands.js` are organized into two objects, `etc` and `tests`. The `etc` object contains rules for commands of all types. The `tests` object contains additional rules that apply to some commands of type `test`, depending on the values of their `which` properties, namely which tests they perform.

Here is an example of a command:

```json
{
  "type": "link",
  "which": "warming",
  "what": "article on climate change"
}
```

And here is the applicable property of the `etc` object in `commmands.js`:

```js
link: [
  'Click a link',
  {
    which: [true, 'string', 'hasLength', 'substring of the link text'],
    what: [false, 'string', 'hasLength', 'comment']
  }
]
```

The rule is an array with two elements: a string ('Click a link') describing the command and an object containing requirements for any command of type `link`.

The requirement `which: [true, 'string', 'hasLength', 'substring of the link text']` specifies what is required for the `which` property of a `link`-type command. The requirement is an array.

In most cases, the array has length 4:
- 0. Is the property (here `which`) required (`true` or `false`)? The value `true` here means that every `link`-type command **must** contain a `which` property.
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, or `'number'`)?
- 2. What other validity criterion applies (if any)? (Empty string if none.) The `hasLength` criterion means that the string must be at least 1 character long.
- 3. Description of the property. Here, the value of `which` is some substring of the text content of the link that is to be clicked. Thus, a `link` command tells Testaro to find the first link whose text content has this substring and click it.

The validity criterion named in item 2 may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': is a string starting with `http`, `https`, or `file`, then `://`, then ending with 1 or more non-whitespace characters
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isState'`: is `'loaded'` or `'idle'`
- `'isTest'`: is the name of a test
- `'isWaitable'`: is `'url'`, `'title'`, or `'body'`
- `'areStrings'`: is an array of strings

When `commands.js` specifies a `withItems` requirement for a `test`-type command, that requirement is an array of length 2, and is always `[true, 'boolean']`. That means that this `test`-type command must have a `withItems` property, whose value must be `true` or `false`. That property tells Testaro whether to itemize the results of that test.

Any `test` command can also (in addition to the requirements in `commands.js`) contain an `expect` requirement. If it does, that requirement has a different format: an array of any non-0 length. The items in that array specify expectations about the results of the test.

For example, a `test` command might have this `expect` property:

```json
"expect": [
  ["total.links", "=", 5],
  ["total.links.underlined", "<", 6],
  ["total.links.outlined"],
  ["docLang", "!", "es-ES]
]
```

That would state the expectation that the `result` property of the `acts` item for that test in the report will have a `total.links` property with the value 5, a `total.links.underlined` property with a value less than 6, **no** `total.links.outlined` property, and a `docLang` property with a value different from `es-ES`.

The second item in each array, if there are 3 items in the array, is an operator, drawn from:
- `<`: less than
- `=`: equal to
- `>`: greater than
- `!`: unequal to

## Batches

There are two ways to use a script to give instructions to Testaro:
- The script can be the complete specification of the operations to perform and the URLs to perform them on.
- The script can specify the operations to perform, and a _batch_ can specify which URLs to perform them on.

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

When you combine a script with a batch, Testaro performs the script, replacing the `which` and `what` properties of all `url` commands with the values in the first object in the `hosts` array of the batch, then again with the values in the second `host` object, and so on. Those replacements also occur in the inserted extra `url` commands mentioned above.

A batch offers an efficient way to perform a uniform set of operations on every host in a set of hosts. In this way you can run the same set of tests on multiple web pages.

A no-batch script offers a way to carry out a complex operation, which can include navigating from one host to another, which is not possible with a batch. Any `url` commands are performed as-is, without changes to their URLs.

## Execution

### Invocation

To run Testaro, create an options object like this:

```javascript
{
  log: [],
  reports: [],
  script: {abc},
  batch: {def}
}
```

Replace `{abc}` with a script object, like the example script shown above.

Replace `{def}` with a batch object, like the example batch shown above, or omit the `batch` property if there is no batch.

Then execute the statement `require('testaro').handleRequest(ghi)`, where `ghi` is replaced with the name of the options object. That statement will run Testaro.

While it runs, Testaro will populate the `log` and `reports` arrays of the options object. When Testaro finishes, the `log` and `reports` arrays will contain its results.

### Environment variables

If a `wave` test is included in the script, an environment variable named `TESTARO_WAVE_KEY` must exist, with your WAVE API key as its value.

Before executing a Testaro script, you can optionally also set the environment variables `TESTARO_DEBUG` (to `'true'` or anything else) and/or `TESTARO_WAITS` (to a non-negative integer). The effects of these variables are described in the `index.js` file.

## Validation

Three _executors_ for Testaro validation are located in the `validation` directory. An executor is a commonJS JavaScript module that runs Testaro and reports whether the results are correct.

The executors are:
- `appNoBatch.js`: Reports whether Testaro runs correctly with a no-batch script.
- `appBatch.js`: Reports whether Testaro runs correctly with a script and a batch.
- `tests.js`: Runs Testaro with each custom test and reports whether the results are correct.

To execute any executor `xyz.js`, call it with the statement `node validation/executors/xyz`. The results will appear in the standard output.

## Contribution

You can define additional Testaro commands and functionality. Contributions are welcome.

## Accessibility principles

The rationales motivating the Testaro-defined tests and scoring procs can be found in comments within the files of those tests and procs, in the `tests` and `procs/score` directories. Unavoidably, each test is opinionated. Testaro itself, however, can accommodate other tests representing different opinions. Testaro is intended to be neutral with respect to questions such as the criteria for accessibility, the severities of accessibility issues, whether accessibility is binary or graded, and the distinction between usability and accessibility.

### Future work

Further development is contemplated, is taking place, or is welcomed, on:
- links with href="#"
- links and buttons styled non-distinguishably
- first focused element not first focusable element in DOM
- never-visible skip links
- buttons with no text content
- modal dialogs
- autocomplete attributes

Additional test packages may be integratable into Testaro. The [`bbc-a11y`](https://github.com/bbc/bbc-a11y) package has been considered, but it has not been updated since 2018 and has vulnerable dependencies.

## Testing challenges

### Activation

Testing to determine what happens when a control or link is activated is straightforward, except in the context of a comprehensive set of tests of a single page. There, activating a control or link can change the page or navigate away from it, interfering with the remaining planned tests of the page.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

### Test-package duplication

Test packages sometimes do redundant testing, in that two or more packages test for the same issues. But such duplications are not necessarily perfect. Therefore, the scoring procs currently defined by Testaro do not select a single package to test for a single issue. Instead, they allow all packages to test for all the issues they can test for, but decrease the weights placed on issues that multiple packages test for. The more packages test for an issue, the smaller the weight placed on each package’s finding of that issue.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`. When tests require temporary files to be written, Testaro writes them there.

## Origin

Testaro is derived from [Autotest](https://github.com/jrpool/autotest), which in turn is derived from accessibility test investigations beginning in 2018.

Testaro omits some functionalities of Autotest, such as:
- tests producing results intended to be human-inspected
- previous versions of scoring algorithms
- file operations for score aggregation, report revision, and HTML reports
- a web user interface

## Etymology

“Testaro” means “collection of tests” in Esperanto.
