# testaro

Ensemble testing for web accessibility

## Introduction

Testaro is an application for automated web accessibility testing.

The purposes of Testaro are to:
- provide programmatic access to accessibility tests defined by several tools
- facilitate the integration of the reports of the tools into a unified report

Testaro is described in [Testaro: Efficient Ensemble Testing for Web Accessibility](https://arxiv.org/abs/2309.10167).

The need for multi-tool integration, and its costs, are discussed in [Accessibility Metatesting: Comparing Nine Testing Tools](https://arxiv.org/abs/2304.07591).

Testaro launches and controls web browsers, performing operations, conducting tests, and recording results.

Testaro is designed to be a workstation-based agent, because many of the tests performed by Testaro simulate the use of a web browser on a workstation. Testaro can be installed under a MacOS, Windows, Debian, or Ubuntu operating system.

Testaro accepts _jobs_, performs them, and returns _reports_.

Other software, located on any server or on the same workstation, can make use of Testaro, performing functions such as:
- Job preparation
- Converting user specifications into jobs
- Job scheduling
- Monitoring of the health of Testaro
- Management of clusters of workstations sharing workloads
- Allocation of responsibilities among workstations
- Receiving and fulfilling user requests for jobs
- Allocating testing responsibilities to human testers
- Combining reports from workstations and human testers
- Analyzing and summarizing (e.g., computing scores on the basis of) test results
- Sending notifications
- Revising, combining, and publishing reports

One software product that performs some such functions is [Testilo](https://www.npmjs.com/package/testilo).

## Dependencies

Testaro uses:
- [Playwright](https://playwright.dev/) to launch browsers, perform user actions in them, and perform tests
- [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion

Testaro performs tests of these tools:
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) (IBM)
- [alfa](https://alfa.siteimprove.com/) (Siteimprove)
- [aslint](https://www.npmjs.com/package/@essentialaccessibility/aslint) (eSSENTIAL Accessibility)
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) (Deque)
- [Editoria11y](https://github.com/itmaybejj/editoria11y) (Princeton University)
- [HTML CodeSniffer](https://www.npmjs.com/package/html_codesniffer) (Squiz Labs)
- [Nu Html Checker](https://github.com/validator/validator) (World Wide Web Consortium)
- [QualWeb core](https://www.npmjs.com/package/@qualweb/core) (University of Lisbon)
- [Testaro](https://www.npmjs.com/package/testaro) (CVS Health)
- [WAVE API](https://wave.webaim.org/api/) (WebAIM)

Some of the tests of Testaro are designed to act as approximate alternatives to tests of vulnerable, restricted, or no longer available tools. In all such cases the Testaro rules are independently designed and implemented, without reference to the code of the tests that inspired them.

## Rules

Each tool accessed with Testaro defines _rules_ and tests _targets_ for compliance with its rules. In total, the nine tools define about a thousand rules. The latest tabulation of tool rules is:

```
alfa: 59
aslint: 136
axe: 80
ed11y: 24
htmlcs: 115
ibm: 132
nuVal: 215
qualWeb: 131
testaro: 40
wave: 58
total: 990
```

Some of the tools are under active development, and their rule counts change over time.

## Job data

A report produced by Testaro discloses:
- raw results of tests conducted by tools
- standardized results of tests conducted by tools
- process data, including statistics on:
    - latency (how long a time each tool takes to run its tests)
    - test prevention (the failure of tools to run on particular targets)
    - logging (browser messaging, including about document errors, during testing)

## Code organization

The main directories containing code files are:
- package root: main code files
- `tests`: files containing the code defining particular tests
- `procs`: shared procedures
- `validation`: code and artifacts for the validation of the Testaro tool

## System requirements

Version 16 or later of [Node.js](https://nodejs.org/en/).

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

To run Testaro after installation, provide the environment variables described below under “Environment variables”.

## Payment

All of the tests that Testaro can perform are free of cost, except those performed by the WAVE tool. The owner of that tool gives new registrants a free allowance of credits before it becomes necessary to pay for use of the API of the tool. The required environment variable for authentication and payment is described below under “Environment variables”.

## Process objects

### Jobs

Here is an example of a job:

```javascript
{
  id: '241213T1200-ts25-w3c',
  what: 'Test W3C with 2 alfa rules',
  strict: true,
  timeLimit: 65,
  acts: [
    {
      type: 'launch',
      which: 'chromium',
      url: 'https://www.w3c.org',
      what: 'Chromium browser'
    },
    {
      type: 'test',
      which: 'alfa',
      what: 'Siteimprove alfa tool',
      rules: ['r25', 'r71']
    }
  ],
  sources: {
    script: 'tp25',
    batch: 'weborgs',
    target: {
      id: 'w3c',
      what: 'World Wide Web Consortium',
      which: 'https://www.w3c.org'
    },
    requester: 'user@domain.org'
  },
  standard: 'only',
  observe: false,
  timeStamp: '241208T1200',
  creationTimeStamp: '241114T0328',
  sendReportTo: 'https://localhost:3004/testapp/api/report',
  mergeID: Q9
}
```

This job contains two _acts_, telling Testaro to:
1. open a page in the Chromium browser and navigate to a specified URL
1. perform two of the tests of the `alfa` tool (the tests for rules `r25` and `r71`) on that URL

Job properties:
- `id`: a string uniquely identifying the job.
- `what`: a description of the job.
- `strict`: `true` or `false`, indicating whether _substantive redirections_ should be treated as failures. These are redirections that do more than add or subtract a final slash.
- `timeLimit`: the number of seconds allowed for the execution of the job.
- `acts`: an array of the acts to be performed (documented below).
- `standard`: `'also'`, `'only'`, or `'no'`, indicating whether rule-violation instances are to be reported in tool-native formats and also in the Testaro standard format, only in the standard format, or only in the tool-native formats.
- `observe`: `true` or `false`, indicating whether tool and Testaro-rule invocations are to be reported to the server as they occur, so that the server can update a waiting client.
- `timeStamp`: a string in `yymmddThhMM` format, specifying a date and time before which the job is not to be performed.
- `creationTimeStamp`: a string in `yymmddThhMM` format, describing when the job was created.
- `sources`: an object describing where the job came from:
   - `script`: the ID of the script (as used by Testilo) from which the job was made, or an empty string if none.
   - `batch` : the ID of the batch (as used by Testilo) from which the target of this job was drawn, or an empty string if none.
   - `target`: an object whose `id`, `what`, and `which` properties describe the target being tested by this job, or, if there was no batch, have empty strings as values.
   - `requester`: the email address that should receive a notice of completion of the job, or an empty string if no notice is to be sent.
- `creationTimeStamp`: the date and time in `yymmddThhMM` format when the job was created.
- `timeStamp`: the date and time in `yymmddThhMM` format before which the job is not to be assigned.
- `sendReportTo`: the URL to which the report of the job is to be sent, or an empty string if the report is not to be sent to a server.
- `mergeID`: a randomly generated alphanumeric ID for the process (such as a Testilo merger of a script and a batch) that created the job, or an empty string if none.

### Reports

#### Introduction

Each tool produces a _tool report_ of the results of its tests. Testaro prunes the tool reports for brevity, removing content that is judged unlikely to be useful. Testaro then appends each tool report to the test act that invoked the tool.

Testaro also generates some data about the job and adds those data to the job, in a `jobData` property.

#### Formats

##### Tool-report formats

The tools listed above as dependencies write their tool reports in various formats. They differ in how they organize multiple instances of the same problem, how they classify severity and certainty, how they point to the locations of problems, how they name problems, etc.

##### Standard format

Testaro helps overcome this format diversity by offering to represent the main facts in each tool report in a single standardized format.

In the conceptual scheme underlying the format standardization of Testaro, each tool has its own set of _rules_, where a rule is an algorithm for evaluating a target and determining whether instances of some kind of problem exist in it. With standardization, Testaro reports, in a uniform way, the outcomes from the application of rules by tools to a target.

Each job can specify how Testaro is to handle report standardization. A job can contain a `standard` property. If the value of that property is `'also'` or `'only'`, Testaro converts some data in each tool report to the standard format. That permits you to ignore the format idiosyncrasies of the tools. If `standard` has the value `'also'`, the job report includes both formats. If the value is `'only'`, or there is no value, the job report includes only the standard format. If the value is `'no'`, the job report includes only the original format of each tool report.

The standard format of each tool report has these properties:
- `prevented`: `true` if the tool failed to run on the page, or otherwise omitted.
- `totals`: an array of 4 integers, representing the counts of problem instances classified by the tool into 4 ordinal degrees of severity. For example, `[2, 13, 0, 5]` would mean that the tool reported 2 instances at the lowest severity, 13 at the next-lowest, none at the third-lowest, and 5 at the highest.
- `instances`: an array of objects describing facts about issue instances reported by the tool. This object has these properties, some of which have empty strings as values when the tool does not provide values:
    - `ruleID`: a code identifying a rule
    - `what`: a description of the rule
    - `count` (optional): the count of instances if this instance represents multiple instances
    - `ordinalSeverity`: how the tool ranks the severity of the instance, on a 4-point ordinal scale from 0 to 3
    - `tagName`: upper-case tagName of the affected element
    - `id`: value of the `id` property of that element
    - `location`: an object with three properties:
        - `doc`: whether the source (`source`) or the browser rendition (`dom`) was tested
        - `type`: the type of location information provided by the tool (`line`, `selector`, `xpath`, or `box`)
        - `spec`: the location information
    - `excerpt`: some or all of the code

The original result of a test act is recorded as the value of a `result` property of the act. The standard-format result is recorded as the value of the `standardResult` property of the act. Its format is shown by this example:

``` javascript
standardResult: {
  totals: [2, 0, 17, 0],
  instances: [
    {
      ruleID: 'rule01',
      what: 'Button type invalid',
      ordinalSeverity: 2,
      tagName: 'BUTTON'
      id: '',
      location: {
        doc: 'dom',
        type: 'box',
        spec: {
          x: 12,
          y: 340,
          width: 46,
          height: 50
        }
      },
      excerpt: '<button type="link"></button>'
    },
    {
      ruleID: 'rule01',
      what: 'Button type invalid',
      ordinalSeverity: 1,
      tagName: 'BUTTON',
      id: 'submitbutton',
      location: {
        doc: 'dom',
        type: 'line',
        spec: 145
      },
      excerpt: '<button type="important">Submit</button>'
    },
    {
      ruleID: 'rule02',
      what: 'Links have empty href attributes',
      count: 17,
      ordinalSeverity: 3,
      tagName: 'A',
      id: '',
      location: {
        doc: '',
        type: '',
        spec: ''
      },
      excerpt: ''
    }
  ]
}
```

If a tool has the option to be used without itemization and is being so used, the `instances` array may be empty, or, as shown above, may contain one or more summary instances. Summary instances disclose the numbers of instances that they summarize with a `count` property.

This standard format reflects some judgments. For example:
- The `ordinalSeverity` property of an instance may have required interpretation. Tools may report severity, certainty, priority, or some combination of those. They may use ordinal or metric quantifications. If they quantify ordinally, their scales may have more or fewer than 4 ranks. Testaro coerces each tool’s severity, certainty, and/or priority classification into a 4-rank ordinal classification. This classification is deemed to express the most common pattern among the tools.
- The `tagName` property of an instance may not always be obvious, because in some cases the rule being tested for requires a relationship among more than one element (e.g., “An X element may not have a Y element as its parent”).
- The `ruleID` property of an instance is a matching rule if the tool issues a message but no rule identifier for each instance. The `nuVal` tool does this. In this case, Testaro is classifying the messages into rules.
- The `ruleID` property of an instance may reclassify tool rules. For example, if a tool rule covers multiple situations that are dissimilar, that rule may be split into multiple rules with distinct `ruleID` properties.

You are not dependent on the judgments incorporated into the standard format, because Testaro can give you the original reports from the tools.

The standard format does not express opinions on issue classification. A rule ID identifies something deemed to be an issue by a tool. Useful reporting from multi-tool testing still requires the classification of tool **rules** into **issues**. If tool `A` has `alt-incomplete` as a rule ID and tool `B` has `image_alt_stub` as a rule ID, Testaro does not decide whether those are really the same issue or different issues. That decision belongs to you. The standardization of tool reports by Testaro eliminates some of the drudgery in issue classification, but not any of the judgment required for issue classification.

### Acts

#### Introduction

The `acts` array was introduced above. This section provides more detail.

Each act object has a `type` property and optionally has a `name` property (used in branching, described below). It must or may have other properties, depending on the value of `type`.

#### Act sequence

The first act in any job has the type `launch`, as shown in the example above. It launches a browser and then uses it to visit a URL.

#### Act types

The subsequent acts can tell Testaro to perform any of:
- _moves_ (clicks, text inputs, hovers, etc.)
- _navigations_ (browser launches, visits to URLs, waits for page conditions, etc.)
- _alterations_ (changes to the page)
- _tests_ (one or more of the tests defined by a tool)
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

An example of a **navigation** is the act of type `launch` above.

If any act alters the page, you can restore the page to its original state for the next act by inserting a new `launch` act (and, if necessary, additional page-specific acts) between them.

Another navigation example is:

```json
{
  "type": "wait",
  "which": "travel",
  "what": "title"
}
```

In this case, Testaro waits until the page title contains the string “travel” (case-insensitively).

The `launch` navigation act allows you to specify a “lowMotion” property as `true`. If you do, then the browser creates tabs with the `reduce-motion` option set to `reduce` instead of `no-preference`. This makes the browser act as if the user has chosen a [motion-reduction option in the settings of the operating system or browser](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion#user_preferences). However, there are often motions on web pages that this option fails to suppress, such as those on the [Inditex](https://www.inditex.com/itxcomweb/en/home) and [Rescuing Leftover Cuisine](https://www.rescuingleftovercuisine.org) home pages. Carousel motion is also not suppressed.

##### Alterations

An example of an **alteration** is:

```json
{
  "type": "reveal",
  "what": "make everything visible"
}
```

This act causes Testaro to alter the `display` and `visibility` style properties of all elements, where necessary, so those properties do not make any element invisible.

##### Tests

###### Introduction

An act of type `test` performs the tests of a tool and reports a result. The result may indicate that a page passes or fails requirements. Typically, accessibility tests report successes and failures. But a test in Testaro is defined less restrictively, so it can report any result. As one example, the Testaro `elements` test reports facts about certain elements on a page, without asserting that those facts are successes or failures.

The `which` property of a `test` act identifies a tool, such as `alfa` or `testaro`.

##### Target modification

Some tools modify the page, so isolation of tests from one another requires that a browser be relaunched or, at least, navigate to the URL again, after a test act running any of those tools before a test act running another tool.

Of the 9 tools, 6 are target-modifying:
- `alfa`
- `aslint`
- `axe`
- `htmlcs`
- `ibm`
- `testaro`

###### Configuration

Every tool invoked by Testaro must have:
- a property in the `tests` object defined in the `run.js` file, where the property name is the code representing the tool and the value is the name of the tool
- a `.js` file, defining the operation of the tool, in the `tests` directory, whose name base is the name of the tool

The `actSpecs.js` file (described in detail below) contains a specification for any `test` act, namely:

```javascript
test: [
  'Perform a test',
  {
    which: [true, 'string', 'isTest', 'test name'],
    rules: [false, 'array', 'areStrings', 'rule IDs or specifications, if not all']
    what: [false, 'string', 'hasLength', 'comment']
  }
],
```

That means that a test act (i.e. an act with a `type` property having the value `'test'`) must have a string-valued `which` property naming a tool and may optionally have an array-valued `rules` property restricting the tests to be reported and/or a string-valued `what` property describing the tool and/or the tests.

If a particular test act either must have or may have any other properties, those properties are specified in the `tools` property in `actSpecs.js`.

When you include a `rules` property, you limit the tests of the tool that are performed or reported. For some tools (`alfa`, `axe`, `htmlcs`, `qualWeb`, and `testaro`), only the specified tests are performed. Other tools (`ibm`, `nuVal`, and `wave`) do not allow such a limitation, so, for those tools, all tests are performed but results are reported from only the specified tests.

The `nuVal`, `qualWeb`, and `testaro` tools require specific formats for the `rules` property. Those formats are described below in the sections about those tools.

The `ed11y` tool does not yet allow rule specification.

###### Examples

An example of a `test` act is:

```json
{
  "type": "test",
  "which": "wave",
  "reportType": 1,
  "what": "WAVE summary"
}
```

Most tools allow you to decide which of their rules to apply. In effect, this means deciding which of their tests to run, since each test is considered a test of some rule. The act example given above,

```javaScript
{
  type: 'test',
  which: 'alfa',
  what: 'Siteimprove alfa tool',
  rules: ['y', 'r25', 'r71']
}
```

specifies that the tests for rules `r25` and `r71` of the `alfa` tool are to be run. If the `'y'` in the `rules` array were `'n'` instead, the act would specify that all the tests of the `alfa` tool **except** those for rules `r25` and `r71` are to be run.

One of the tools that allows rule selection, Testaro, has some rules that take additional arguments. As prescribed in `actSpecs.js`, you can pass such additional arguments to the `reporter` functions of those Testaro tests with an `args` property. Example:

```javaScript
{
  type: 'test',
  which: 'testaro',
  what: 'Testaro tool',
  rules: ['y', 'hover', 'focInd'],
  args: {
    hover: [20],
    focInd: [false, 300]
  }
}
```

This act specifies that the Testaro test `hover` is to be run with the additional argument `20`, and `focInd` is to be run with the additional arguments `false` and `300`.

###### Expectations

Any `test` act can contain an `expect` property. If it does, the value of that property must be an array of arrays. Each array specifies expectations about the results of the operation of the tool.

For example, a `test` act might have this `expect` property:

```javaScript
'expect': [
  ['standardResult.totals.0', '=', 0],
  ['standardResult.instances.length', '=', 0]
]
```

That would state the expectations that the `standardResult` property of the act will report no rule violations at severity level 0 and no instances of rule violations.

The first item in each array is an identifier of a property of the act. The item has the format of a string with `.` delimiters. Each `.`-delimited segment its the name of the next property in the hierarchy. If the current object is an array, the next segment must be a non-negative integer, representing the index of an element of the array.

If there is only 1 item in an array, it states the expectation that the specified property does not exist. Otherwise, there are 3 items in the array.

The second item in each array, if there are 3 items, is an operator, drawn from:
- `<`: less than
- `=`: equal to
- `>`: greater than
- `!`: unequal to
- `i`: includes
- `e`: equivalent to (parsed identically as JSON)

The third item in each array, if there are 3 items in the array, is the criterion with which the value of the first property is compared.

A typical use for an `expect` property is checking the correctness of a Testaro test. Thus, the validation jobs in the `validation/tests/jobs` directory all contain `test` acts with `expect` properties. See the “Validation” section below.

When a `test` act has an `expect` property, the result for that act has an `expectations` property reporting whether the expectations were satisfied. The value of `expectations` is an array of objects, one object per expectation. Each object includes a `property` property identifying the expectation, and a `passed` property with `true` or `false` value reporting whether the expectation was satisfied. If applicable, it also has other properties identifying what was expected and what was actually reported.

##### Branching

An example of a **branching** act is:

```json
{
  "type": "next",
  "if": ["totals.invalid", ">", 0],
  "jump": -4,
  "what": "redo search if any invalid elements"
}
```

This act checks the result of the previous act to determine whether its `result.totals.invalid` property has a positive value. If so, it changes the next act to be performed, specifying the act 4 acts before this one.

A `next` act can use a `next` property instead of a `jump` property. The value of the `next` property is an act name. It tells Testaro to continue performing acts starting with the act having that value as the value of its `name` property.

#### Tools

The tools whose tests Testaro performs have particularities described below.

##### ASLint

The `aslint` tool makes use of the [`aslint-testaro` fork](https://www.npmjs.com/package/aslint-testaro) of the [`aslint` repository](https://github.com/essentialaccessibility/aslint), which, unlike the published `aslint` package, contains the `aslint.bundle.js` file.

##### HTML CodeSniffer

The `htmlcs` tool makes use of the `htmlcs/HTMLCS.js` file. That file was created, and can be recreated if necessary, as follows:

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

##### IBM Equal Access

The `ibm` tests require the `aceconfig.js` file.

As of 2 March 2023 (version 3.1.45 of `accessibility-checker`), the `ibm` tool threw errors when hosted under the Windows operating system. To prevent these errors, it was possible to edit two files in the `accessibility-checker` package as follows:

In `node_modules/accessibility-checker/lib/ACEngineManager.js`, remove or comment out these lines starting on line 169:

```javaScript
if (nodePath.charAt(0) !== '/') {
    nodePath = "../../" + nodePath;
}
```

In `node_modules/accessibility-checker/lib/reporters/ACReporterJSON.js`, add these lines starting on line 106, immediately before the line `var resultsFileName = pathLib.join(resultDir, results.label + '.json');`:

```javaScript
// Replace the colons in the label with hyphen-minuses.
results.label = results.label.replace(/:/g, '-');
```

These changes were proposed as pull requests 1333 and 1334 (https://github.com/IBMa/equal-access/pulls).

The `ibm` tool is one of two tools (`testaro` is the other) with a `withItems` property. If you set `withItems` to `false`, the result includes the counts of “violations” and “recommendations”, but no information about the rules that gave rise to them.

Experimentation indicates that the `ibm` tools emits untrappable errors for some targets when the content argument given to it is the page content rather than the page URL. Therefore, it is safer to use `true` as the value of `withNewContent` for the `ibm` tool.

##### Nu Html Checker

The `nuVal` tool performs the tests of the Nu Html Checker.

Its `rules` argument is **not** an array of rule IDs, but instead is an array of rule _specifications_. A rule specification for `nuVal` is a string with the format `=ruleID` or `~ruleID`. The `=` prefix indicates that the rule ID is invariable. The `~` prefix indicates that the rule ID is variable, in which case the `ruleID` part of the specification is a matching regular expression, rather than the exact text of a message. This `rules` format arises from the fact that `nuVal` generates customized messages and does not accompany them with rule identifiers.

##### QualWeb

The `qualWeb` tool performs the ACT rules, WCAG Techniques, and best-practices tests of QualWeb. Only failures and warnings are included in the report. The EARL report of QualWeb is not generated, because it is equivalent to the report of the ACT rules tests.

QualWeb allows specification of rules for 3 modules: `act-rules`, `wcag-techniques`, and `best-practices`. If you include a `rules` argument in a QualWeb test act, its value must be an array of 1, 2, or 3 strings. Any string in that array is a specification for one of these modules. The string has this format:

```javascript
'mod:m,n,o,p,…'
```

In that format:
- Replace `mod` with `act`, `wcag`, or `best`.
- Replace `m`, `n`, `o`, `p`, etc. with the 0 or more integers that identify rules.

For example, `'best:6,11'` would specify that QualWeb is to test for `best-practices` rules `QW-BP6` and `QW-BP11`, but not for any other `best-practices` rules.

When a string contains only a module prefix and no integers, such as `best:`, it specifies that the module is not to be run at all.

When no string pertains to a module, then QualWeb will test for all of the rules in that module.

Thus, when the `rules` argument is omitted, QualWeb will test for all of the rules in all of these modules.

The target can be provided to QualWeb either as an existing page or as a URL. Experience indicates that the results can differ between these methods, with each method reporting some rule violations or some instances that the other method does not report. For at least some cases, more rules are reported violated when an existing page is provided (`withNewItems: false`).

##### Testaro

If you do not specify rules when using the `testaro` tool, Testaro will test for the rules listed in the `evalRules` object of the `tests/testaro.js` file.

The `rules` argument for a `testaro` test act is an array whose first item is either `'y'` or `'n'` and whose remaining items are rule IDs. If `'y'`, then only the specified rules’ tests are performed. If `'n'`, then all the evaluative tests are performed, **except** for the specified rules.

The `testaro` tool (like the `ibm` tool) has a `withItems` property. If you set it to `false`, the `standardResult` object will contain an `instances` property with summaries that identify issues and instance counts. If you set it to `true`, some of the instances will be itemized.

Unlike any other tool, the `testaro` tool requires a `stopOnFail` property, which specifies whether a failure to conform to any rule (i.e. any value of `totals` other than `[0, 0, 0, 0]`) should terminate the execution of tests for the remaining rules.

Warnings in the `testaro/hover.js`, `testaro/motion.js`, and `procs/visChange.js` files advise you to avoid launching particular browser types for the performance of particular Testaro tests.

Several Testaro tests make use of the `init()` function in the `procs/testaro` module. That function samples elements if the population of elements to be tested is larger than 100. The purpose is to achieve reasonable performance. The sampling overweights elements near the beginning of a page, because of the tendency of that location to have important and atypical elements.

You can add custom rules to the rules of any tool. Testaro provides a template, `data/template.js`, for the definition of a rule to be added. Once you have created a copy of the template with revisions, you can move the copy into the `testaro` directory and add an entry for your custom rule to the `evalRules` object in the `tests/testaro.js` file. Then your custom rule will act as a Testaro rule. Some `testaro` rules are simple enough to be fully specified in JSON files. You can use any of those as a template if you want to create a sufficiently simple custom rule, namely a rule whose prohibited elements are all and only the elements matching a CSS selector. More details about rule creation are in the `CONTRIBUTING.md` file.

##### WAVE

If a `wave` test act is included in the job, an environment variable named `WAVE_KEY` must exist, with your WAVE API key as its value. You can get it from [WebAIM](https://wave.webaim.org/api/).

The `wave` API does not accept a transmitted document for testing. WAVE must be given only a URL, which it then visits to perform its tests. Therefore, you cannot manipulate a page and then have WAVE test it, or ask WAVE to test a page that cannot be reached directly with a URL.

This limitation of WAVE may be overcome in a future version of Testaro by means of the invocation of the WAVE Chrome extension with Playwright.

#### Browser types

After any act in a job, you can change the browser type by inserting a `launch` act. One reason for specifying a particular browser type is that particular tests have different results with different browser types. Another is that you may wish to perform tests with more than a single browser type.

The warning comments in the `testaro/hover.js` and `testaro/motion.js` files state that those tests operate correctly only with the `webkit` browser type. The warning comment in the `testaro/focInd.js` file states that that test operates incorrectly with the `firefox` browser type.

When you want to run some tests of a tool with one browser type and other tests of the same tool with another browser type, you can do so by splitting the rules into two test acts. For example, one test act can specify the rules as

```javascript
['y', 'r15', 'r54']
```

and the other test act can specify the rules as

```javascript
['n', 'r15', 'r54']
```

Together, they get all tests of the tool performed. Before each test act, you can ensure that the latest `launch` act has specified the browser type to be used in that test act.

#### `actSpecs` file

##### Introduction

The `actSpecs.js` file contains rules governing acts. The rules determine whether an act is valid.

##### Rule format

The rules in `actSpecs.js` are organized into two objects, `etc` and `tests`. The `etc` object contains rules for acts of all types. The `tools` object contains additional rules that apply to some acts of type `test`, depending on the values of their `which` properties, namely which tools they perform tests of.

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
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, `'number'`, or `'object'`)?
- 2. What other validity criterion applies (if any)? (Empty string if none.) The `hasLength` criterion means that the string must be at least 1 character long.
- 3. Description of the property. In this example, the description says that the value of `which` must be a substring of the text content of the link that is to be clicked. Thus, a `link` act tells Testaro to find the first link whose text content has this substring and click it.

The validity criterion named in item 2 may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': is a string starting with `http`, `https`, or `file`, then `://`, then ending with 1 or more non-whitespace characters
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isState'`: is `'loaded'` or `'idle'`
- `'isTest'`: is the name of a tool
- `'isWaitable'`: is `'url'`, `'title'`, or `'body'`
- `'areStrings'`: is an array of strings

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
node call run
node call run be76p
```

In the second example, `be76p` is the initial characters of the ID of a job saved as a JSON file in the `todo` subdirectory of the `process.env.JOBDIR` directory.

The `call` module will find the first job file with a matching name if an argument is given, or the first job file if not. Then the module will execute the `doJob` function of the `run` module on the job, save the report in the `raw` subdirectory of the `REPORTDIR` directory, and archive the job file in the `done` subdirectory of the `JOBDIR` directory.

#### Watch

In watch mode, Testaro periodically checks for a job to run and, when a job is obtained, performs it.

##### Directory watch

Testaro can watch for a job in a directory, with the `dirWatch` function, which can be executed by either a module or a user.

###### By a module

```javaScript
const {dirWatch} = require('./dirWatch');
dirWatch(true, 300);
```

In this example, a module asks Testaro to check a directory for a job every 300 seconds, to perform the jobs in the directory if any are found, and then to continue checking. If the first argument is `false`, Testaro will stop checking after performing 1 job. If it is `true`, Testaro continues checking until the process is stopped.

The directory where Testaro checks for jobs is specified by `process.env.JOBDIR`. Testaro checks for jobs in its `todo` subdirectory and, when it has performed a job, moves it into the `done` subdirectory.

Testaro creates a report for each job and saves the report in the directory specified by `process.env.REPORTDIR`.

###### By a user

```javaScript
node call dirWatch true 300
```

The arguments and behaviors described above for execution by a module apply here, too.

##### Network watch

Testaro can poll servers for jobs to be performed.

An instance of Testaro is an _agent_ and has an identifier specified by `process.env.AGENT`. A Testaro instance identifies itself when polling servers, allowing servers to decide whether to give the instance a job to do.

The URLs polled by Testaro are specified by `process.env.JOB_URLS`. The format of that environment variable is a `+`-delimited list of URLs, including schemes. If one of the URLs is `https://testrunner.org/a11ytest/api/job`, and if a Testaro instance has the agent ID `tester3`, then a job request is a `GET` request to `https://testrunner.org/a11ytest/api/job?agent=tester3`.

Once a Testaro instance obtains a network job, Testaro performs it and adds the result data to the job, which then becomes the job report. Testaro sends the report in a `POST` request to the URL specified by the `sendReportTo` property of the job.

Network watching can be repeated or 1-job. One-job watching stops after 1 job has been performed.

After checking all the URLs in succession without getting a job from any of them, Testaro waits for a prescribed time before continuing to check.

###### By a module

```javaScript
const {netWatch} = require('./netWatch');
netWatch(true, 300, true);
```

In this example, a module asks Testaro to check the servers for a job every 300 seconds, to perform any jobs obtained from the servers, and then to continue checking until the process is stopped. If the first argument is `false`, Testaro will stop checking after performing 1 job.

The third argument specifies whether Testaro should be certificate-tolerant. A `true` value makes Testaro accept SSL certificates that fail verification against a list of certificate authorities. This allows testing of `https` targets that, for example, use self-signed certificates. If the third argument is omitted, the default for that argument is implemented. The default is `true`.

###### By a user

```javaScript
node call netWatch true 300 true
```

The arguments and behaviors described above for execution by a module apply here, too. If the first argument is `true`, you can terminate the process by entering `CTRL-c`.

### Environment variables

In addition to their uses described above, environment variables can be used by acts of type `text`, as documented in the `actSpecs.js` file.

Before making Testaro run a job, you can optionally also set `process.env.DEBUG` (to `'true'` or anything else) and/or `process.env.WAITS` (to a non-negative integer). The effects of these variables are described in the `run.js` file.

You may store environment variables in an untracked `.env` file if you wish, and Testaro will recognize them. Here is a template for a `.env` file:

```conf
WAVE_KEY=yourwavekey
JOB_URLs=https://yourserver.tld/job+http://localhost:3004/testapp
JOBDIR=../testing/jobs/ThisWorkstation
REPORTDIR=../testing/reports
AGENT=ThisWorkstation
DEBUG=false
WAITS=0
```

## Validation

### Validators

Testaro and the tests of the Testaro tool can be validated with the _executors_ located in the `validation/executors` directory.

The executor for a single test is `test`. To execute it for any test `xyz`, call it with the statement `npm test xyz`.

The other executors are:

- `run`: validates immediate test execution
- `watchDir`: validates directory watching
- `watchNet`: validates network watching
- `tests`: validates all the Testaro tests

To execute any executor `xyz` among these, call it with the statement `npm run xyz`.

The `tests` executor makes use of the jobs in the `validation/tests/jobs` directory, and they, in turn, run tests on HTML files in the `validation/tests/targets` directory.

## Contribution

You can define additional Testaro acts and functionality. Contributions are welcome.

Please report any issues, including feature requests, at the [repository](https://github.com/jrpool/testaro/issues).

## Accessibility principles

The rationales motivating the Testaro-defined tests can be found in comments within the files of those tests, in the `tests` directory. Unavoidably, each test is opinionated. Testaro itself, however, can accommodate other tests representing different opinions. Testaro is intended to be neutral with respect to questions such as the criteria for accessibility, the severities of accessibility defects, whether accessibility is binary or graded, and the distinction between usability and accessibility.

## Testing challenges

### Abnormal termination

On rare occasions a test throws an error that cannot be handled with a `try`-`catch` structure. It has been observed, for example, that the `ibm` test does this when the page content, rather than the page URL, is given to `getCompliance()` and the target is `https://globalsolutions.org` or `https://monsido.com`.

### Activation

Testing to determine what happens when a control or link is activated is straightforward, except in the context of a comprehensive set of tests of a single page. There, activating a control or link can change the page or navigate away from it, interfering with the remaining planned tests of the page.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

### Test prevention

Test targets employ mechanisms to prevent scraping, automated form submission, and other automated actions. These mechanisms may interfere with testing. When a test act is prevented by a target, Testaro reports this prevention.

Some targets prohibit the execution of alien scripts unless the client can demonstrate that it is the requester of the page. Failure to provide that evidence results in the script being blocked and an error message being logged, saying “Refused to execute a script because its hash, its nonce, or unsafe-inline does not appear in the script-src directive of the Content Security Policy”. This mechanism affects tools that insert scripts into a target in order to test it. Those tools include `axe`, `aslint`, `ed11y`, and `htmlcs`. To comply with this requirement, Testaro obtains a _nonce_ from the response that serves the target. Then the file that runs the tool adds that nonce to the script as the value of a `nonce` attribute when it inserts its script into the target.

### Tool duplicativity

Tools sometimes do redundant testing, in that two or more tools test for the same defects, although such duplications are not necessarily perfect. This fact creates three problems:
- One cannot be confident in excluding some tests of some tools on the assumption that they perfectly duplicate tests of other tools.
- The Testaro report from a job documents each tool’s results separately, so a single defect may be documented in multiple locations within the report, making the direct consumption of the report inefficient.
- An effort to aggregate the results into a single score may distort the scores by inflating the weights of defects that happen to be discovered by multiple tools.

To deal with the above problems, you can:
- configure `test` acts for tools to exclude tests that you consider duplicative
- create derivative reports that organize results by defect types rather than by tool
- take duplication into account when defining scoring rules

Some measures of these kinds are included in the scoring and reporting features of the Testilo package.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## Related packages

[Testilo](https://www.npmjs.com/package/testilo) is an application that:
- converts lists of targets and lists of issues into jobs
- produces scores and adds them to the raw reports of Testaro
- produces human-oriented HTML digests from scored reports
- produces human-oriented HTML comparisons of the scores of targets

Testilo contains procedures that reorganize report data by issue rather than tool, and that compensate for duplicative tests when computing scores.

Testaro is derived from [Autotest](https://github.com/jrpool/autotest). Autotest was created as a monolithic accessibility testing package, but that forced functionalities to be hosted on a workstation merely because it was impractical to host Playwright elsewhere. Testaro embodies an architectural decision to isolate workstation-dependent functionalities.

Testaro therefore omits some functionalities of Autotest, such as:
- tests producing results intended to be human-inspected
- scoring (now in Testilo)
- file operations for score aggregation, report revision, and HTML reports (now in Testilo)
- a web user interface

## Code style

The JavaScript code in this project generally conforms to the ESLint configuration file `.eslintrc`. However, the `htmlcs/HTMLCS.js` file implements an older version of JavaScript. Its style is regulated by the `htmlcs/.eslintrc.json` file.

## Origin

Work on the custom tests in this package began in 2017, and work on the multi-package ensemble that Testaro implements began in early 2018. These two aspects were combined into the [Autotest](https://github.com/jrpool/autotest) package in early 2021 and into the more single-purpose packages, Testaro and Testilo, in January 2022.

## Etymology

“Testaro” means “collection of tests” in Esperanto.

/*
  © 2021–2024 CVS Health and/or one of its affiliates. All rights reserved.

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
