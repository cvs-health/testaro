# testaro

Federated accessibility test automation

## Summary

Testaro is a collection of collections of web accessibility tests.

The purpose of Testaro is to provide programmatic access to accessibility tests defined in several test packages, including Testaro itself.

Testaro launches and controls web browsers, performing operations, conducting tests, and recording results.

Testaro is designed to be a workstation-based agent. Testaro can be installed on a workstation running under OS X or Windows, or potentially Ubuntu Linux. Software that uses Testaro can be installed on the same workstation or any other workstation or server. Such other software can perform functions that do not require workstation features, such as:
- Test scheduling
- Monitoring
- Management of clusters of workstations sharing workloads
- Allocation of responsibilities among workstations
- Receiving and fulfilling requests from users for testing
- Converting user specifications into instructions for workstations
- Allocating testing responsibilities to human testers
- Combining reports from workstations and human testers
- Analyzing and summarizing (e.g., computing scores on the basis of) test results
- Sending notifications
- Publishing reports

One software product that performs some such functions is [Testilo](https://www.npmjs.com/package/testilo).

## Dependencies

Testaro uses:
- [Playwright](https://playwright.dev/) to launch browsers, perform user actions in them, and perform tests
- [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion

Testaro includes some of its own accessibility tests. In addition, it performs the tests in:
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) (the IBM Equal Access Accessibility Checker)
- [alfa](https://alfa.siteimprove.com/) (Siteimprove alfa)
- [Continuum Community Edition](https://www.webaccessibility.com/tools/)
- [HTML CodeSniffer](https://www.npmjs.com/package/html_codesniffer) (Squiz HTML CodeSniffer)
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) (Deque Axe-core)
- [Tenon](https://tenon.io/documentation/what-tenon-tests.php) (Level Access)
- [WAVE API](https://wave.webaim.org/api/) (WebAIM WAVE)
- [Nu Html Checker](https://github.com/validator/validator)

Some of the Testaro tests are derived from tests performed by the [BBC Accessibility Standards Checker](https://github.com/bbc/bbc-a11y).

As of this version, the counts of tests in the packages referenced above were:
- Alfa: 103
- Axe-core: 138
- Continuum Community Edition: 267
- Equal Access: 163
- HTML CodeSniffer: 98
- Tenon: 180
- WAVE: 110
- Nu Html Checker: 147
- subtotal: 1206
- Testaro tests: 24
- grand total: 1230

## Quasi-tests

Reports produced by Testaro contain data in addition to the results of these tests. Such data can be used like tests. In particular, the data include:
- Latency (how long a time each test takes)
- Test prevention (the failure of tests to run on particular targets)
- Logging (browser messaging, including about document errors, during testing)

## Code organization

The main directories containing code files are:
- package root: main code files
- `tests`: files containing the code defining particular tests
- `procs`: shared procedures
- `validation`: code and artifacts for the validation of Testaro

## System requirements

Version 14 or later of [Node.js](https://nodejs.org/en/).

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

However, if the Playwright dependency is ever updated to a newer version, you must also reinstall its browsers by executing the statement `npx playwright install`.

## Payment

All of the tests that Testaro can perform are free of cost, except those in the Tenon and WAVE packages. The owner of each of those packages gives new registrants a free allowance of credits before it becomes necessary to pay for use of the API of the package. The required environment variables for authentication and payment are described below under “Environment variables”.

## Process objects

### Introduction

A _job_ is an object containing instructions for Testaro.

A _report_ is an object containing a job, with added properties describing the results from Testaro running the job.

### Jobs

Here is an example of a job:

```javascript
{
  id: 'be76p-ts25-w3c',
  what: 'Test host with alfa',
  strict: true,
  timeLimit: 65,
  acts: [
    {
      type: 'launch',
      which: 'chromium',
      what: 'Chromium browser'
    },
    {
      type: 'url',
      which: 'https://www.w3c.org',
      what: 'World Wide Web Consortium',
      id: 'w3c'
    },
    {
      type: 'test',
      which: 'alfa',
      what: 'Siteimprove alfa package'
    }
  ],
  sources: {
    script: 'tp25',
    batch: 'weborgs',
    target: {
      id: 'w3c',
      what: 'World Wide Web Consortium'
    },
    requester: 'user@domain.org'
  },
  jobCreationTime: '2023-05-26T14:28',
  timeStamp: 'be76p'
}
```

This job contains three `acts`, telling Testaro to:
1. open a page in the Chromium browser
1. navigate to some URL
1. perform the tests in the `alfa` package on that URL

Job properties:
- `id`: This is a string consisting of alphanumeric ASCII characters and hyphen-minus (-), intended to be unique. When this job is saved as a JSON file, the file name is `be76p-sp25-w3c.json`. Typically, a job is created from a _script_, and the job ID adds a timestamp prefix and a target suffix to the script ID. Here the script ID would have been `ts25`.
- `what`: This is a description of the job.
- `strict`: This is `true` or `false`, indicating whether _substantive redirections_ should be treated as failures. These are redirections that do more than add or subtract a final slash. For example, if `strict` is true, a redirection from `xyz.com` to `www.xyz.com` or to `xyz.com/en` will abort the job.
- `timeLimit`: This property is the number of seconds allowed for the execution of the job.
- `acts`: This is an array of the acts to be performed. Acts are documented below.
- `sources`: This object has properties describing where the job came from:
   - `script`: This is the ID of the script from which the job was made. Other applications, such as Testilo, can make jobs from scripts. When Testilo creates a job, the job inherits its `id`, `what`, `strict`, `timeLimit`, and `acts` properties from the script. However, Testilo can create multiple jobs from a single script, replacing acts of type `placeholder` with one or more target-specific acts. Examples of scripts can be found in the Testilo package.
   - `batch`: If the job was one of a set of jobs created by a merger of a script and a batch of targets, this property’s value is the ID of the batch, or otherwise is an empty string.
   - `target`: If the job was made from a script with placeholder acts, this property describes the target whose target-specific acts have replaced the placeholder acts. Otherwise `target` is an empty object. Testilo also makes the `id` property of the target the third segment of the job ID.
   - `requester`: This string is the email address to receive a notice of completion of the running of the job.
- `creationTime`: This is the time when the job was created from a script.
- `timeStamp`: This string is a compact representation of the job creation time, suitable for inclusion in the ID of the job.

### Reports

A _report_ is a copy of a job file. It begins as a pure copy. Testaro adds data to it as Testaro runs the job. Specifically, Testaro:
- Adds a `jobData` property and populates it with data about the job.
- Adds properties to the acts, describing the results of the performance of the acts.

### Acts

#### Introduction

The `acts` array was introduced above. This section provides more detail.

Each act object has a `type` property and optionally has a `name` property (used in branching, described below). It must or may have other properties, depending on the value of `type`.

#### Act sequence

The first two acts in any job have the types `launch` and `url`, respectively, as shown in the example above. They launch a browser and then use it to visit a URL.

#### Act types

The subsequent acts can tell Testaro to perform any of:
- _moves_ (clicks, text inputs, hovers, etc.)
- _navigations_ (browser launches, visits to URLs, waits for page conditions, etc.)
- _alterations_ (changes to the page)
- _tests_ (whether in dependency packages or defined within Testaro)
- _branching_ (continuing from an act other than the next one)

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

When the texts of multiple elements of the same type will contain the same `which` value, you can include an `index` property to specify the index of the target element, among all those that will match.

##### Navigations

An example of a **navigation** is the command of type `url` above.

Once you have included a `url` command in a job, you do not need to add more `url` commands unless you want the browser to visit a different URL or revisit the same URL.

If any act alters the page, you can restore the page to its original state for the next act by inserting new `launch` and `url` acts (and, if necessary, additional page-specific acts) between them.

Another navigation example is:

```json
{
  "type": "wait",
  "which": "travel",
  "what": "title"
}
```

In this case, Testaro waits until the page title contains the string “travel” (case-insensitively).

The `launch` navigation command allows you to specify a “lowMotion” property as `true`. If you do, then the browser creates tabs with the `reduce-motion` option set to `reduce` instead of `no-preference`. This makes the browser act as if the user has chosen a [motion-reduction option in the settings of the operating system or browser](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion#user_preferences). However, there are often motions on web pages that this option fails to suppress, such as those on the [Inditex](https://www.inditex.com/itxcomweb/en/home) and [Rescuing Leftover Cuisine](https://www.rescuingleftovercuisine.org) home pages. Carousel motion is also not suppressed.

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

A test performs operations and reports results. The results may or may not directly indicate that a page passes or fails requirements. Typically, accessibility tests report successes and failures. But a test in Testaro is defined less restrictively, so it can report any results. As one example, the Testaro `elements` test reports facts about certain elements on a page, without asserting that those facts are successes or failures.

The term “test” has two meanings for Testaro:
- An act is a test (_test command_) if its `type` property has the value `test`.
- An act with type `test` whose `which` value is the name of a package, such as Continuum, performs multiple tests defined by that _test package_.

Thus, if a command of type `test` runs Continuum, Continuum performs multiple tests and reports their results.

###### Configuration

Every test in Testaro must have:
- a property in the `tests` object defined in the `run.js` file, where the property name is the name of the test and the value is a description of the test
- a `.js` file, defining the test, in the `tests` directory, whose name base is the name of the test

The `actSpecs.js` file (described in detail below) contains a specification for any `test` act, namely:

```json
test: [
  'Perform a test',
  {
    which: [true, 'string', 'isTest', 'test name'],
    what: [false, 'string', 'hasLength', 'comment']
  }
],
```

That means that a test (i.e. a command with a `type` property having the value `'test'`) must have a string-valued `which` property naming a test and may optionally have a string-valued `what` property describing the test.

If a particular test either must have or may have any other properties, those properties must be specified in the `tests` property in `actSpecs.js`.

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

###### Continuum

The `continuum` packaged test makes use of the files in the `continuum` directory. The test inserts the contents of all three files into the page as scripts and then uses them to perform the tests of the Continuum package.

Level Access on 22 August 2022 granted authorization for the copying of the `AccessEngine.community.js` file insofar as necessary for allowing Continuum community edition tests to be included in Testaro.

###### IBM Equal Access

The `ibm` packaged test requires the `aceconfig.js` file.

If you choose to invoke this packaged test with the `withNewContent` property specified, you will choose whether the tested content is the content of the existing page or is retrieved anew with the document URL. Typically, both methods succeed and deliver similar results. However, sometimes one method succeeds and the other fails, or one method reports more violations than the other does. In those cases, most often the success, or the larger violation count, arises from the existing page (`withNewContent: false`).

###### HTML CodeSniffer

The `htmlcs` packaged test makes use of the`htmlcs/HTMLCS.js` file. That file was created, and can be recreated if necessary, as follows:

1. Clone the [HTML CodeSniffer package](https://github.com/squizlabs/HTML_CodeSniffer).
1. Make that package’s directory the active directory.
1. Install the HTML CodeSniffer dependencies by executing `npm install`.
1. Build the HTML CodeSniffer auditor by executing `grunt build`.
1. Copy the `build/HTMLCS.js` and `build/licence.txt` files into the `htmlcs` directory of Testaro.
1. Edit the Testaro copy of `htmlcs/HTMLCS.js` to produce the changes shown below.

The changes in `htmlcs/HTMLCS.js` are:

```diff
479a480
>     '4_1_2_attribute': 'attribute',
6482a6484
>     var messageStrings = new Set();
6496d6497
<         console.log('done');
6499d6499
<         console.log('done');
6500a6501
>       return Array.from(messageStrings);
6531c6532,6534
<       console.log('[HTMLCS] ' + typeName + '|' + msg.code + '|' + nodeName + '|' + elementId + '|' + msg.msg + '|' + html);
---
>       messageStrings.add(
>         typeName + '|' + msg.code + '|' + nodeName + '|' + elementId + '|' + msg.msg + '|' + html
>       );
```

###### Tenon

Most packaged tests require only one act, but the `tenon` packaged test requires two acts:
- An act of type `tenonRequest`.
- An act of type `test` with `tenon` as the value of `which`.

Example:

```json
  {
    "type": "tenonRequest",
    "id": "a",
    "withNewContent": true,
    "what": "Tenon API version 2 test request"
  }
  ```

  followed by

```json
  {
    "type": "test",
    "which": "tenon",
    "id": "a",
    "what": "Tenon API version 2 result retrieval"
  }
```

The reason for this is that the Tenon API operates asynchronously. You ask it to perform a test, and it puts your request into a queue. To learn whether Tenon has completed your test, you make a status request. You can continue making status requests until Tenon replies that your test has been completed. Then you submit a request for the test result, and Tenon replies with the result. (As of May 2022, however, status requests were observed to misreport still-running tests as completed. The `tenon` test works around that by requesting only the result and using the response to determine whether the tests have been completed.)

Tenon says that tests are typically completed in 3 to 6 seconds but that the latency can be longer, depending on demand.

Therefore, you can include a `tenonRequest` act early in your job, and a `tenon` test act late in your job. Tenon will move your request through its queue while Testaro is processing your job. When Testaro reaches your `tenon` test act, Tenon will most likely have completed your test. If not, the `tenon` test will wait and then make a second request before giving up.

Thus, a `tenon` test actually does not perform any test; it merely collects the result. The page that was active when the `tenonRequest` act was performed is the one that Tenon tests.

In case you want to perform more than one `tenon` test with the same job, you can do so. Just give each pair of acts a distinct `id` property, so each `tenon` test act will request the correct result.

Tenon recommends giving it a public URL rather than giving it the content of a page, if possible. So, it is best to give the `withNewContent` property of the `tenonRequest` act the value `true`, unless the page is not public.

If a `tenon` test is included in a job, environment variables named `TENON_USER` and `TENON_PASSWORD` must exist, with your Tenon username and password, respectively, as their values. You can obtain those from [Tenon](https://tenon.io/documentation/overview).

###### WAVE

If a `wave` test is included in the job, an environment variable named `WAVE_KEY` must exist, with your WAVE API key as its value. You can get it from [WebAIM](https://wave.webaim.org/api/).

The `wave` API does not accept a transmitted document for testing. WAVE must be given only a URL, which it then visits to perform its tests. Therefore, you cannot manipulate a page and then have WAVE test it, or ask WAVE to test a page that cannot be reached directly with a URL.

This limitation of WAVE may be overcome in a future version of Testaro by means of the invocation of the WAVE Chrome extension with Playwright.

###### BBC Accessibility Standards Checker

The BBC Accessibility Standards Checker has obsolete dependencies with security vulnerabilities. Therefore, it is not used as a dependency of Testaro. Instead, 6 of its tests are reimplemented, in some cases with revisions, as Testaro tests. They are drawn from the 18 automated tests of the Checker. The other 12 tests were found too duplicative of other tests to justify reimplementation.

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

#### `actSpecs` file

##### Introduction

The `actSpecs.js` file contains rules governing acts. The rules determine whether an act is valid.

##### Rule format

The rules in `actSpecs.js` are organized into two objects, `etc` and `tests`. The `etc` object contains rules for acts of all types. The `tests` object contains additional rules that apply to some acts of type `test`, depending on the values of their `which` properties, namely which tests they perform.

Here is an example of an act:

```json
{
  "type": "link",
  "which": "warming",
  "what": "article on climate change"
}
```

And here is the applicable property of the `etc` object in `actSpecs.js`:

```js
link: [
  'Click a link',
  {
    which: [true, 'string', 'hasLength', 'substring of the link text'],
    what: [false, 'string', 'hasLength', 'comment']
  }
]
```

The rule is an array with two elements: a string ('Click a link') describing the act and an object containing requirements for any act of type `link`.

The requirement `which: [true, 'string', 'hasLength', 'substring of the link text']` specifies what is required for the `which` property of a `link`-type act. The requirement is an array.

In most cases, the array has length 4:
- 0. Is the property (here `which`) required (`true` or `false`)? The value `true` here means that every `link`-type act **must** contain a `which` property.
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, or `'number'`)?
- 2. What other validity criterion applies (if any)? (Empty string if none.) The `hasLength` criterion means that the string must be at least 1 character long.
- 3. Description of the property. In this example, the description says that the value of `which` must be a substring of the text content of the link that is to be clicked. Thus, a `link` act tells Testaro to find the first link whose text content has this substring and click it.

The validity criterion named in item 2 may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': is a string starting with `http`, `https`, or `file`, then `://`, then ending with 1 or more non-whitespace characters
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isState'`: is `'loaded'` or `'idle'`
- `'isTest'`: is the name of a test
- `'isWaitable'`: is `'url'`, `'title'`, or `'body'`
- `'areStrings'`: is an array of strings

Any `test` act can also (in addition to the requirements in `actSpecs.js`) contain an `expect` property. If it does, the value of that property must be an array of arrays. Each array specifies expectations about the results of the test.

For example, a `test` command might have this `expect` property:

```javaScript
'expect': [
  ['total.links', '=', 5],
  ['total.links.underlined', '<', 6],
  ['total.links.outlined'],
  ['docLang', '!', 'es-ES']
]
```

That would state the expectation that the `result` property of the act for that test in the report will have a `total.links` property with the value 5, a `total.links.underlined` property with a value less than 6, **no** `total.links.outlined` property, and a `docLang` property with a value different from `es-ES`.

The first item in each array is an identifier of a property within the `result` property. The item has the format of a string with `.` delimiters. Each `.`-delimited segment its the name of the next property in the hierarchy. If the current object is an array, the next segment must be a non-negative integer, representing the index of an element of the array. For example, `items.1.attributes.0` references the first element of the array that is the `attributes` property of the object that is the second element of the array that is the `items` property of `result`. (In JavaScript, this would be written `items[1].attributes[0]`, but in the `expect` property all property names are `.`-delimited.)

If there is only 1 item in an array, it states the expectation that the specified property does not exist. Otherwise, there are 3 items in the array.

The second item in each array, if there are 3 items in the array, is an operator, drawn from:
- `<`: less than
- `=`: equal to
- `>`: greater than
- `!`: unequal to
- `i`: includes

The third item in each array, if there are 3 items in the array, is the criterion with which the value of the first property is compared.

A typical use for an `expect` property is checking the correctness of a Testaro test. Thus, the validation jobs in the `validation/tests/jobs` directory all contain `test` commands with `expect` properties. See the “Validation” section below.

## Execution

### Introduction

Testaro can be called by modules and by users.

### Functions

Testaro contains these modules that export executable functions:
- `run.js` exports `doJob` for immediate execution.
- `watch.js` exports `cycle` for watch-triggered execution.

#### Imports

Before a module can execute a Testaro function, it must import that function from the module that exports it. A Testaro module can import function `f` from module `m` with the statement

```javascript
const {f} = require('./m');`
```

The argument of `require` is a path relative to the directory of the module in which this code appears. If the module is in a subdirectory, `./m` will need to be revised. In an executor within `validation/executors`, it must be revised to `../../m`.

A module in another Node.js package that has Testaro as a dependency can execute the same statements, except changing `'./m'` to `'testaro/m'`.

#### Immediate

A job can be immediately executed as follows:

##### By a module

```javascript
const {doJob} = require('./run');
doJob(report)
.then(() => …);
```

The `report` variable here references a copy of a job to be used as a report.

Testaro will run the job and modify the `report` object. When Testaro finishes, the `acts` and `jobData` properties of `report` will contain the results. The final statement can further process the `report` object as desired in the `then` callback.

The Testilo package contains functions that can create jobs from scripts and add scores and explanations to reports.

##### By a user

```bash
node call run be76p
```

In this example, `be76p` is the initial characters of the ID of a job saved as a JSON file in the `todo` subdirectory of the `process.env.JOBDIR` directory.

The `call` module will find the first job file with a matching name, execute the `doJob` function of the `run` module on the job, save the report in the `raw` subdirectory of the `process.env.REPORTDIR` directory, and archive the job file in the `done` subdirectory of the `process.env.JOBDIR` directory.

#### Watch

In watch mode, Testaro periodically checks for a job to run. When such a job exists, Testaro runs it and produces a report. Testaro may continue watching after the first report, or may quit.

##### By a module

```javaScript
const {cycle} = require('./watch');
cycle(true, true, 30);
```

##### By a user

```javaScript
node call watch true true 30
```

##### Arguments

The arguments passed to `cycle` by a module or to `watch` by a user are:
- whether to watch a directory (`true`) or the network (`false`)
- whether to continue watching indefinitely after the first report (`true` or `false`)
- how many seconds to wait after finding no job before checking again (a nonnegative number)

##### Directory watch

With directory watch, Testaro checks whether the `todo` subdirectory of the job directory (`process.env.JOBDIR`) contains a job.

When Testaro finds one or more jobs to do, the `watch` module runs the first job, saves the report in the `raw` subdirectory of the `process.env.REPORTDIR` directory, and moves the job file from the `todo` subdirectory to the `done` subdirectory of the `process.env.JOBDIR` directory.

Since Testaro runs the first job (i.e. the job whose file name is first in ASCII order), whoever populates the `todo` subdirectory of the `process.env.JOBDIR` directory with job files has control over the order in which Testaro runs them. For example, to force a new job to be run before the already waiting jobs, one can give it a filename that comes before that of the first waiting job.

##### Network watch

Network watching is designed for a situation in which:
- A managing server may be able to give work to multiple workstations that run Testaro.
- A workstation running Testaro can contact a managing server, but the server may not be able to contact a workstation.

With network watch, the initiator of an interaction is Testaro, not the server. When Testaro is available, it requests a job from a server. If the response is a JSON representation of a job, Testaro runs the job and sends the report to the server.

If multiple workstations run Testaro and do work for the same server, the server can assign jobs to specific agents by requiring each instance of Testaro to have a distinct value of `process.env.AGENT`.

### Environment variables

In addition to their uses described above, environment variables can be used by commands of type `text`, as documented in the `commands.js` file.

Before making Testaro run a job, you can optionally also set `process.env.DEBUG` (to `'true'` or anything else) and/or `process.env.WAITS` (to a non-negative integer). The effects of these variables are described in the `run.js` file.

You may store environment variables in an untracked `.env` file if you wish, and Testaro will recognize them. Here is a template for a `.env` file:

```conf
URL_INJECT=yes
TENON_USER=you@yourdomain.tld
TENON_PASSWORD=yourTenonPassword
WAVE_KEY=yourwavekey
PROTOCOL=https
JOB_URL=yourserver.tld/job
REPORT_URL=yourserver.tld/report
JOBDIR=../testing/jobs/ThisWorkstation
REPORTDIR=../testing/reports
AGENT=ThisWorkstation
DEBUG=false
```

## Validation

### Validators

Testaro and its custom tests can be validated with the _executors_ located in the `validation/executors` directory.

The executor for a single test is `test`. To execute it for any test `xyz`, call it with the statement `npm test xyz`.

The other executors are:

- `run`: validates low-level invocation
- `watchDir`: validates directory watching
- `watchNet`: validates network watching
- `tests`: validates all the Testaro tests

To execute any executor `xyz` among these, call it with the statement `npm run xyz`.

The `tests` executor makes use of the jobs in the `validation/tests/jobs` directory, and they, in turn, run tests on HTML files in the `validation/tests/targets` directory.

## Contribution

You can define additional Testaro commands and functionality. Contributions are welcome.

Please report any issues, including feature requests, at the [repository](https://github.com/jrpool/testaro/issues).

## Accessibility principles

The rationales motivating the Testaro-defined tests can be found in comments within the files of those tests, in the `tests` directory. Unavoidably, each test is opinionated. Testaro itself, however, can accommodate other tests representing different opinions. Testaro is intended to be neutral with respect to questions such as the criteria for accessibility, the severities of accessibility issues, whether accessibility is binary or graded, and the distinction between usability and accessibility.

## Testing challenges

### Abnormal termination

On rare occasions a test throws an error that terminates the Node process and cannot be handled with a `try`-`catch` structure. It has been observed, for example, that the `ibm` test does this when run on the host at `https://zenythgroup.com/index` or `https://monsido.com`.

### Activation

Testing to determine what happens when a control or link is activated is straightforward, except in the context of a comprehensive set of tests of a single page. There, activating a control or link can change the page or navigate away from it, interfering with the remaining planned tests of the page.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

### Test-package duplicativity

Test packages sometimes do redundant testing, in that two or more packages test for the same issues, although such duplications are not necessarily perfect. This fact creates three problems:
- One cannot be confident in excluding some tests of some packages on the assumption that they perfectly duplicate tests of other packages.
- The Testaro report from a job documents each package’s results separately, so a single defect may be documented in multiple locations within the report, making the direct consumption of the report inefficient.
- An effort to aggregate the results into a single score may distort the scores by inflating the weights of defects that happen to be discovered by multiple packages.

The tests provided with Testaro do not exclude any apparently duplicative tests from packages.

To deal with the above problems, you can:
- revise package `test` commands to exclude tests that you consider duplicative
- create derivative reports that organize results by defect types rather than by package
- take duplication into account when defining scoring rules

Some measures of these kinds are included in the scoring and reporting features of the Testilo package.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## Related packages

[Testilo](https://www.npmjs.com/package/testilo) is an application that:
- merges batches of targets and scripts to produce jobs
- produces scores and adds them to the raw reports of Testaro
- produces human-oriented HTML digests from scored reports
- produces human-oriented HTML comparisons of the scores of targets

Testilo contains procedures that reorganize report data by defect rather than test package, and that compensate for duplicative tests when computing scores.

Testaro is derived from [Autotest](https://github.com/jrpool/autotest). Autotest was created as a monolithic accessibility testing package, but that forced functionalities to be hosted on a workstation merely because it was impractical to host Playwright elsewhere. Testaro embodies an architectural decision to isolate workstation-dependent functionalities.

Testaro therefore omits some functionalities of Autotest, such as:
- tests producing results intended to be human-inspected
- scoring (now in Testilo)
- file operations for score aggregation, report revision, and HTML reports (now in Testilo)
- a web user interface

## Code style

The JavaScript code in this project generally conforms to the ESLint configuration file `.eslintrc`. However, the `htmlcs/HTMLCS.js` file implements an older version of JavaScript. Its style is regulated by the `htmlcs/.eslintrc.json` file.

## Origin

Work on the custom tests in this package began in 2017, and work on the multi-package federation that Testaro implements began in early 2018. These two aspects were combined into the [Autotest](https://github.com/jrpool/autotest) package in early 2021 and into the more single-purpose packages, Testaro and Testilo, in January 2022.

## Etymology

“Testaro” means “collection of tests” in Esperanto.
