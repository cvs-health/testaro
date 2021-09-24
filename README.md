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

## Specification

### Scripts

Autotest performs the **commands** in a **script**. When you run Autotest, it lists your scripts and asks you which one it should execute.

So, before running Autotest, you must create at least one script.

A script is a JSON file with 2 properties:

```json
{
  "what": "Description of the script",
  "commands": []
}
```

The `commands` property’s value is an array of commands. Each command has a `type` property and other properties specifying the command. You can look up the command types and their required and optional properties in the `commands.js` file.

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

The subsequent commands can tell Autotest to perform any of:
- moves (clicks, text inputs, hovers, etc.)
- navigations (visits to other URLs, waits for conditions on a page, etc.)
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

In this case, Autosest clicks the first button whose text content includes the string “Close” (case-insensitively).

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

### Batches

A script can be the complete specification of an Autotest job.

However, if you want to perform the same set of commands repeatedly, changing only the URL from one run to another, you can combine a script with a **batch**. A batch is a list of URLs. A batch is a JSON file with this format:

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
}
```

After you install Autotest and its dependencies, to run Autotest you open a command shell (a terminal), navigate to the Autotest directory, and enter the command `node index`. That causes Autotest’s server to start. The server listens for requests on port 3000 of your computer, `localhost`.

To make requests to Autotest, you visit `localhost:3000/autotest` with a web browser and follow the instructions displayed by Autotest.

The sequence is:

1. Autotest asks you for the locations and names of the directories that you want it to use. If you have put lines into the `.env` file defining these directories, Autotest will propose the paths from those lines, and you can accept or change them. The lines take these forms (where you supply paths of your choice after the `=`):
   - `SCRIPTDIR=../autotest-my-x/scripts`
   - `REPORTDIR=../autotest-my-x/reports/script`
   - `BATCHDIR=../autotest-my-x/batches`
1. Autotest shows you a list of the scripts in the script directory you specified and a list of the batches in the batch directory that you specified.
1. You choose one of those scripts.
1. You also choose a batch to run the script on, or “None” if the script will run without a batch.
1. Autotest performs the acts specified by the commands in the script. If you also specified a batch, Autotest repeats the acts for all of the URLs in the batch.
1. Autotest outputs a new page to your browser. If you specified a script without a batch, or with a batch containing only one URL, the page contains a report. If you specified a batch with two or more URLs, the page logs progress but does not contain any reports.
1. Autotest also writes files into its project directory:
   - a report file for the script, or one report file per URL if there was a batch
   - image files if necessary for exhibits in reports (i.e. if the images cannot be linked to)
   - image files from screen shots made in tests for motion
1. When you have finished using Autotest, you stop it by entering <kbd>CTRL-c</kbd>.

## How do scripts work?

Autotest requires a script as the source of the commands that it obeys.

A script is a JSON file containing an array of commands.

Each command is an object, with at least a `type` property, identifying the command type. The rules for command validity are contained in a `commands.js` file.

A script file has this structure:


The first command launches a browser. The second command uses that browser to visit a URL. Subsequent commands do whatever you choose.

## How do batches work?

A batch file is a JSON file with this structure:

```json
{
  "what": "Description of the batch",
  "hosts": [
    {
      "which": "https://abc.def",
      "what": "Description of this URL"
    },
    …
  ]
}
```

The `hosts` property is an array of objects that specify URLs and their descriptions.

If you specify a batch for a script to run on, the script is run once for each of the hosts. Before each execution, the URL of the host is substituted into the script, replacing the value of the `which` property of each command of type `url`.

## To batch or not to batch?

A batch offers an efficient way to perform a uniform set of commands on every URL in a set of URLs. Running the same set of tests on multiple web pages is an example.

A no-batch script offers a way to carry out a complex operation. The script can click, press keyboard keys, hover, wait for reactions, follow links, go to specific new URLs, take screen shots, and perform tests.

## What tests can be run?

Near the top of the `index.js` file is an object named `tests`. It describes all asailable tests.

## How are test results aggregated into scores?

One of the commands listed in `commands.js` is `score`.

Here is an example of a command rule from `commands.json`:

<pre>"test": [
  "Perform a custom test (what: description)",
  {
    "which": [true, "string", "isCustomTest"],
    "what": [false, "string", "hasLength"]
  }
]</pre>

In this example, the command type is `test`, and the purpose of the command is to perform a custom test. A command of this type **must** have a `which` property and **may** optionally have a `what` property (the `true` and `false` values specify whether the property is required). Both properties must have string values (they cannot be numbers, arrays, or other objects). The `which` property must satisfy the `isCustomTest` requirement, which means that its value must be the name of a custom test. The `what` property, if it exists, must satisfy the `hasLength` requirement, which means it must not be a blank string.

As shown in this example, each command rule is an array with two elements. The first element is a description of what a command of that type does. The second element is an object that has the properties that commands of that type may or must have. Each property has an array value. The first element is a boolean value, specifying whether the property is required (`true`) or optional (`false`). The second element is a string identifying the type of value the property must have (`string`, `number`, `array`, or `object`). If there is a third element, it identifies a validity criterion.

## Other features

### Tests

Autotest contains custom tests. There is a list of the custom tests, named `tests`, in the CONSTANTS section of the `index.js` file.

#### Future work

Other custom tests on which further development is contemplated or is taking place include:
- links with href="#"
- links and buttons that are not reachable with keyboard navigation
- links and buttons styled non-distinguishably
- first focused element not first focusable element in DOM
- skip link that is never visible
- button inside link
- button with no text content

#### Testing obstacles

##### Operability

No method for the comprehensive testing of element operability has been found yet. Such a test would report whether clicking the location of any particular element would dispatch any event.

Ideally, such a test would not require actually clicking the element location, because doing so could change the page and/or its URL, thereby preventing the conduct of tests on any not-yet-tested elements. But no method is known for such a test.

Tests that perform clicks on elements appear difficult to diagnose. No method has been found for determining whether such a click dispatches an event or whether code is executed in the browser immediately after such a click. One experiment was able to distinguish an operable element from an inoperable element by setting the timeout on an `elementHandle.click()` method to 37 milliseconds. At 35 milliseconds, the method did not return within the timeout on any element. At 40 milliseconds, it returned within the timeout on all elements. But at 37 milliseconds it returned within the timeout on inoperable elements but not on an operable element. However, it seems reasonable to assume that the threshold timeout depends on the event(s) dispatched by a click and there is therefore no uniform timeout distinguishing operable from inoperable elements.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

The `markOperable` test proc and the `focOp` test that uses it therefore approximate operability testing, but do not test definitively for operability.

### Test-package integrations

Autotest provides opportunities to integrate two accessibility test packages, [Axe](https://github.com/dequelabs/axe-core) and [WAVE](https://wave.webaim.org/), into scripts. The rules governing their commands in scripts are described above.

#### Axe

Axe integration depends on the [axe-playwright](https://www.npmjs.com/package/axe-playwright) package. Violations reported with that package exclude <dfn>incomplete</dfn> (also called <q>needs-review</q>) violations and violations of <q>experimental</q> rules.

#### WAVE

WAVE integration depends on the user having a WAVE API key. Use of the WAVE API depletes the user’s WAVE API credits. The `wave1`, `wave2`, and `wave4` commands perform WAVE tests with respective `reporttype` values on a specified URL. Such a test costs 1, 2, or 3 credits, respectively ($0.04 per credit, or less in quantity). When you register with WebAIM and obtain a WAVE API key, you must add a line to your `.env` file, in the format `WAVE_KEY=x0x0x0x0x0x0x` (where `x0x0x0x0x0x0x` represents your key).

##### WAVE versus Axe

Axe and WAVE are both combinations of multiple accessibility tests. They partly overlap. Where they do, they sometimes agree and sometimes disagree on severity.

For example, when a `button` is empty and unlabeled, or an `input` is unlabeled, Axe reports a <q>critical</q> violation and WAVE reports an <q>error</q>. However, when a `select` is unlabeled, Axe reports a <q>critical</q> violation and WAVE reports only an <q>alert</q>.

An example of a difference in coverage: When a form control has an explicit label (a `label` element referencing the control with a `for` attribute), but that label is nullified by a higher-precedence label (an `aria-label` or `aria-labelledby` attribute), WAVE reports an <q>alert</q>, but Axe does not report a violation at all.

##### JHU-WAVE

One of the Autotest procs implements the <dfn>JHU-WAVE</dfn> rule. That is an algorithm comparing web pages that have been subjected to the `waves` test in a script. The rule is used by the Johns Hopkins University (_JHU_) Disability Health Research Center in its [Vaccine Website Accessibility](https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/) dashboard. The rule is described summarily on the cited page. Missing details were obtained from WebAIM, which conducted the testing for JHU.

The proc is `procs/report/jhuwave.js`. By executing the command `node procs/report/jhuwave xxx` (where `xxx` represents the timeStamp of a report file or another string that you have changed the timestamp to), you can apply the rule to the pages whose `waves` test results are recorded in the report file.

The JHU-WAVE rule is defined as follows:

1.  Give each page a rank, on the basis of its error total, namely the total of its <q>Errors</q> and its <q>Contrast Errors</q>, with 0 being the best rank (i.e. the smallest total). If there is a tie for the next rank, use that rank for all of the tied pages, but then skip ranks so that the used rank plus the skipped ranks are equal in number to the number of tied pages.
2.  Give each page a rank, on the basis of its error density, namely its error total divided by the total number of its elements. Use the same rule for ties.
3.  Give each page a rank, on the basis of its alert total. Use the same rule for ties.
4.  For each page, multiply its error-total rank by 6, multiply its error-density rank by 3, and multiply its alert rank by 1.
5.  Total those three products. That total is the page’s score. The smaller the score, the better the page, according to the JHU-WAVE rule.

#### bbc-a11y

The [BBC Accessibility Standards Checker](https://github.com/bbc/bbc-a11y) is a Node.js project that might be added to Autotest. However, the package (`bbc-a11y`) was last updated in 2018 and has accumulated several severe vulnerabilities, including:
- `electron` (IPC messages delivered to the wrong frame)
- `httpism`
- `trim-newlines` (regular expression denial of service)
- `underscore` (arbitrary code execution)
- `meow`

For this reason, it is not incorporated into Autotest.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## More information

The `doc` directory contains additional information, including some examples of scripts that you can test with.
