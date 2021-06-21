# autotest

Accessibility test automation

## What is Autotest?

Autotest is a prototype application investigating methods of web-application test automation, with an emphasis on tests for accessibility.

## System requirements

Install Autotest on a host where version 14 or later of [Node.js](https://nodejs.org/en/) is installed.

## What does Autotest do?

Autotest performs automated tests on web documents.

## What technologies does Autotest use?

Autotest uses Node.js to run:
- an `HTTP(S)` server to interact with you
- an `HTTP(S)` client to interact with websites

Autotest uses the [Playwright](https://playwright.dev/) package to launch browsers, perform user actions in them, and perform tests.

## How do you use Autotest?

You give instructions to Autotest in a <dfn>script</dfn>. A script follows rules documented below. Each script is a sequence of <dfn>commands</dfn>, namely instructions for things that Autotest should do, called <dfn>acts</dfn>.

Each script is stored in its own file, located in a scripts directory.

It is possible to have more than one scripts directory.

After you install Autotest and its dependencies, to run Autotest you open a command shell (a terminal), navigate to the Autotest directory, and enter the command `node index`. That causes Autotest’s server to start. The server listens for requests on port 3000 of your computer, `localhost`.

To make requests to Autotest, you visit `localhost:3000/autotest` with a web browser and follow the instructions displayed by Autotest.

The sequence is:

1. Autotest asks you for the locations and names of the directories that you want it to use. If you have put lines into the `.env` file defining these directories, Autotest will propose the paths from those lines, and you can accept change them. The lines take these forms (where you supply paths of your choice after the `=`):
   - `SCRIPTDIR=../autotest-my-x/scripts`
   - `REPORTDIR=../autotest-my-x/reports/script`
1. Autotest shows you a list of the scripts in the script directory you specified.
1. You choose one of those scripts.
1. Autotest performs the acts specified by the commands in that script.
1. Autotest outputs a new page to your browser containing:
   - a report
   - exhibits
1. If any exhibits include images that cannot be retrieved from a URL, Autotest creates those images and stores them in an `images` directory within the report directory.
1. As Autotest proceeds, it also writes a copy of the report to a `report-xxx.json` file (where `xxx` represents a timestamp) in the report directory that you specified. In case Autotest throws an error while performing the acts or takes longer than your browser is willing to wait, the browser report may fail to appear, but the file report, up to the point of the error or disconnection, will be preserved.
1. When you have finished using Autotest, you stop it by entering <kbd>CTRL-c</kbd>.
1. You can rename the report after it is created. Renaming it by changing its timestamp to some other string will not interfere with any Autotest utilities.
1. You can delete reports and images that you no longer need.

## How are scripts created?

Autotest requires a script as the source of the commands that it obeys.

A script is a JSON file representing an array of commands.

Each command is an object, with a structure like this:

```javascript
{
  "type": "abc",
  "which": "def",
  "what": "ghi"
}
```

Each command has a `type` property. There is a closed set of types, and the value of `type` must be one of those types.

Commands of some types also require either or both of two other properties, `which` and `what`. They provide additional information to Autotest that it needs in order to perform the commanded act, or sometimes `what` provides documentation explaining the purpose of the act.

The command types, and the properties they require, are documented in the file `doc/commands.json`. This file not only tells you what the requirements are, but also specifies them to Autotest when it validates a script. The `commands.json` file represents an array of command rules, one per command type.

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

Tests that perform clicks on elements appear difficult to diagnose. No method has been found for determining whether such a click dispatches an event or whether code is executed in the browser immediately after such a click. One experiment was able to distinguish an operable element from an inoperable element by setting the timeout on an `elementHandle.click()` method to 37 milliseconds. At 35 milliseconds, the method did not return within the timeout on any element. At 40 seconds, it returned within the timeout on all elements. But at 37 milliseconds it returned within the timeout on inoperable elements but not on an operable element. However, it seems reasonable to assume that the threshold timeout depends on the event(s) dispatched by a click and there is therefore no uniform timeout distinguishing operable from inoperable elements.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

The `markOperable` test proc and the `focop` test that uses it therefore approximate operability testing, but does not test definitively for operability.

### Procs

Autotest also contains some utilities that perform useful work. These are called _procs_ and are located in the `procs` directory. Procs belong to two categories:
- _Report procs_ convert one or more reports to different reports.
- _Script procs_ help create scripts.
- _Test procs_ contain code that is used by multiple tests.

Comments at the beginning of each proc describe what the proc does.

### Test-package integrations

Autotest provides opportunities to integrate two accessibility test packages, [Axe](https://github.com/dequelabs/axe-core) and [WAVE](https://wave.webaim.org/), into scripts. The rules governing their commands in scripts are described above.

#### Axe

Axe integration depends on the [axe-playwright](https://www.npmjs.com/package/axe-playwright) package. Violations reported with that package exclude <dfn>incomplete</dfn> (also called <q>needs-review</q>) violations and violations of <q>experimental</q> rules.

#### WAVE

WAVE integration depends on the user having a WAVE API key. Use of the WAVE API depletes the user’s WAVE API credits. The `waves` command performs a WAVE test with `reporttype=1` on a specified URL. Such a test costs 1 credit ($0.04, or less in quantity). When you register with WebAIM and obtain a WAVE API key, you must add a line to your `.env` file, in the format `WAVE_KEY=x0x0x0x0x0x0x` (where `x0x0x0x0x0x0x` represents your key).

##### JHU-WAVE

One of the Autotest procs implements the <dfn>JHU-WAVE</dfn> rule. That is an algorithm comparing web pages that have been subjected to the `waves` test in a script. The rule is used by the Johns Hopkins University (_JHU_) Disability Health Research Center in its [Vaccine Website Accessibility](https://disabilityhealth.jhu.edu/vaccinedashboard/webaccess/) dashboard. The rule is described summarily on the cited page. Missing details were obtained from WebAIM, which conducted the testing for JHU.

The proc is `procs/report/jhuwave.js`. By executing the command `node procs/report/jhuwave xxx` (where `xxx` represents the timeStamp of a report file or another string that you have changed the timestamp to), you can apply the rule to the pages whose `waves` test results are recorded in the report file.

The JHU-WAVE rule is defined as follows:

1.  Give each page a rank, on the basis of its error total, namely the total of its <q>Errors</q> and its <q>Contrast Errors</q>, with 0 being the best rank (i.e. the smallest total). If there is a tie for the next rank, use that rank for all of the tied pages, but then skip ranks so that the used rank plus the skipped ranks are equal in number to the number of tied pages.
2.  Give each page a rank, on the basis of its error density, namely its error total divided by the total number of its elements. Use the same rule for ties.
3.  Give each page a rank, on the basis of its alert total. Use the same rule for ties.
4.  For each page, multiply its error-total rank by 6, multiply its error-density rank by 3, and multiply its alert rank by 1.
5.  Total those three products. That total is the page’s score. The smaller the score, the better the page, according to the JHU-WAVE rule.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## More information

The `doc` directory contains additional information, including some examples of scripts that you can test with.
