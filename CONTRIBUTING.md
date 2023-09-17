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

Testaro has about 50 of its own rules, in addition to the approximately 600 rules of the other tools that it integrates. According to the issue classifications in the [Testilo](https://www.npmjs.com/package/testilo) package, these 650 or so rules can be distilled into about 260 accessibility _issues_, because some rules of some tools duplicate (or approximately duplicate) some rules of other tools.

However, many other significant accessibility issues exist that are not covered by any of the existing rules. Testaro welcomes contributions of new rules for such issues.

### Step 1

The first step in contributing a new rule to Testaro is to satisfy yourself that it will not duplicate existing rules. The `procs/score/tic35.js` file in the Testilo package should be helpful here.

### Step 2

The second step is to write a validator for the new rule. A validator is software that defines the correct behavior of the implementation of the rule.

Every Testaro rule has a correspoding validator. A validator has two parts:
- A job file, in the `validation/tests/jobs` directory.
- A target directory, within the `validation/tests/targets` directory. The target directory contains one or more HTML files that will be tested by the job.

If you inspect some of the jobs and targets in the `validation/tests` directory, you can see that the jobs perform tests on the target documents and also define the expected behavior.

### Step 3

The third step is to add an entry to the `evalRules` or `etcRules` object in the `tests/testaro.js` file.

### Step 4

The fourth step is to implement the rule. To optimize quality, it may be wise for one person to perform steps 1, 2, and 3, and then for a second person to perform step 4.

The rule is implemented in a JavaScript or JSON file that is saved in the `testaro` directory.



develop the rule in accord with your specification. Developing the rule consists of:
1. Creating a rule-definition file.
1. Adding the file to the `testaro` directory.
1. Validating it.

For example, if the new rule has the ID `bigAlt`, it must succeed when the statement `npm test bigAlt` is executed.

### Simple rules

Some existing Testaro rules are simple enough to be defined in JSON files. If a new rule is similarly simple, you can define it with a similar JSON file.

An example is the `titledEl` rule:

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

To create a simple rule, you can copy one of the existing JSON files and replace the values with values that are appropriate for the new rule. Testaro uses the properties in the file as follows:
- Every element matching the selector is treated as a violator of the rule.
- Testaro describes violations with one of the `complaints` values. If the user has requested itemized results, the `instance` value is used; otherwise the `summary` value is used.
- Testaro assigns the `ordinalSeverity` value as the ordinal severity of each violation. This is a scale of integers, from 0 to 3.
- When Testaro itemizes results, it reports the tag name of violating elements. When it only summarizes results, it includes the `summaryTagName`. If every violating element necessarily has one particular tag name, then you should make that (e.g., `BUTTON`) the value of `summaryTagName`.

### Complex rules

Your new rule may not be quite so simple. For example, it may need to examine the selected elements and identify only some of them as rule violators.

You will need to define such a rule in a JavaScript file, rather than a JSON file.

An example of such an existing rule is `filter`. The test for that rule initially selects all elements that descend from the `body` element (or a sample of 100 such elements in the page contains more than 100). Then it examines each selected element to determine whether it violates the rule. Specifically, it determines whether the element has a `filter` style property with a value other than `'none'`. It reports those violations.

To define such a rule, you can copy an existing rule file and replace parts of its code as needed. Examples include:
- `allSlanted`, `distortion`, `filter`, `miniText`, `zIndex`: violations based on element styles.
- `linkTitle`: violations based on attributes and text content.
