# Contributing to Testaro

## Types of contributions

Testaro can benefit from contributions of various types, such as:
- Adding other tools to the tools that it integrates.
- Improving its execution speed.
- Improving its own rule implementations.
- Implementing new rules.

## Adding tools

To come.

## Improving execution speed

To come.

## Improving rule implementations.

To come.

## Implementing new rules

Testaro has about 50 of its own rules, in addition to the approximately 600 rules of the other tools that it integrates. According to the issue classifications in the [Testilo](https://www.npmjs.com/package/testilo) package, these 650 or so rules can be classified into about 260 accessibility _issues_, because some rules of some tools at least approximately duplicate some rules of other tools.

However, many other significant accessibility issues exist that are not covered by any of the existing rules. Thus, Testaro welcomes contributions of new rules for such issues.

### Step 1

The first step in contributing a new rule to Testaro is to satisfy yourself that it will not duplicate existing rules. The `procs/score/tic35.js` file in the Testilo package should be helpful here.

### Step 2

The second step is to write a validator for the new rule. A validator is software that defines the correct behavior of the implementation of the rule.

Every Testaro rule has a correspoding validator. A validator has two parts:
- A job file, in the `validation/tests/jobs` directory. It tells Testaro what tests to perform and what the results should be.
- A target directory, within the `validation/tests/targets` directory. The target directory contains one or more HTML files that will be tested by the job.

Inspecting some of the jobs and targets in the `validation/tests` directory can help you understand how validators work.

### Step 3

The third step is to add an entry to the `evalRules` or `etcRules` object in the `tests/testaro.js` file.

### Step 4

The fourth step is to implement the new rule by creating a JavaScript or JSON file and saving it in the `testaro` directory.

To optimize quality, it may be wise for one person to perform steps 1, 2, and 3, and then for a second person independently to perform step 4 (“clean-room” development).

At any time after an implementation is attempted or revised, the developer can run the validation on it, simply by executing the statement `npm test xyz` (replacing `xyz` with the name of the new rule). When the implementation fails validation, diagnosis may find fault either with the implementation or with the validator.

Whether a new rule should be implemented in JSON or JavaScript depends on the complexity of the rule. The JSON format is effective for simple rules,and JavaScript is needed for more complex rules.

### Simple rules

You can create a JSON-defined rule if a single CSS selector can identify all and only the elements on a page that violate the rule.

Suppose, for example, that you want a rule prohibiting `i` elements (because `i` represents confusingly many different semantic properties). A single CSS selector, namely `"i"`, will identify all the `i` elements on the page, so this rule can be defined with JSON.

 Substantially more complex rules, too, can satisfy this criterion. An example is the `captionLoc` rule, which prohibits `caption` elements that are not the first children of `table` elements. Its CSS selector is `"*:not(table) > caption, caption:not(:first-child)"`. That selector identifies every `caption` element that is the child of any non-`table` element, and also every caption element that is not the first among its sibling elements. The only ways to **avoid** being caught by this selector are (1) not to be a `caption` element and (2) to be a `caption` element that is the first child of a `table` element. Thus, the selector catches all the `caption` elements that are not first children of `table` elements, and only those.

You can copy and revise any of the existing JSON files in the `testaro` directory to implement a new rule. If, for example, you start with a copy of the `titledEl` file, you can change its properties to fit your new rule. In particular:

```json
{
  "ruleID": "titledEl",
  "selector": "[title]:not(input, button, textarea, select, iframe):visible",
  "complaints": {
    "instance": "Ineligible element has a title attribute",
    "summary": "Ineligible elements have title attributes"
  },
  "ordinalSeverity": 2,
  "summaryTagName": ""
}
```

- Assign a violation description for a single instance to `complaints.instance`.
- Assign a violation description for a summary instance (when itemization has been turned off) to `complaints.summary`.
- Assign an integer from 0 through 3 to `ordinalSeverity`.
- If all instances of violations of the rule necessarily involve elements of the same type, assign its tag name (such as `"BUTTON"`) to `summaryTagName`.

### Complex rules

More complex Testaro rules are implemented in JavaScript. You can use any of the existing JavaScript rules, or `data/template.js` file, as an example to begin with. Examples include:
- `allSlanted`, `distortion`, `filter`, `lineHeight`, `miniText`, `zIndex`: violations based on element styles.
- `focOp`, `opFoc`, `targetSize`: violations based on attributes
- `linkTitle`: violations based on attributes and text content.
- `linkAmb`, `pseudoP`, `radioSet`: violations based on relations among elements and text.
- `hover`, `tabNav`: violations based on performing actions and observing page behavior.
- `role`: violations based on data about standards.
- `docType`, `title`: violations based on page properties.

Some utility functions in modules in the `procs` directory are available for support of new rules.
