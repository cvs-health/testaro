# testaro

Ensemble testing for web accessibility

## Contributing

Contributions to Testaro are welcome.

### Testaro rule specification

Testaro integrates 8 accessibility testing tools, and one of them is Testaro itself. The Testaro tool has defined 43 rules, and the other 7 tools have defined about 600 rules in the aggregate. Contributing a new Testaro rule can add value if the new rule will not merely duplicate one of the existing rules. The issue classification (`tic…`) files in the `procs` directory of the [Testilo](https://www.npmjs.com/package/testilo) package can help in this determination.

If you determine that a new Testaro rule would be valuable, the first step is to specify it. This specification has the following parts:
1. Adding an entry to the `evalRules` or `etcRules` object in the `tests/testaro.js` file.
1. Adding a validation target directory to the `validation/tests/targets` directory.
1. Adding at least one validation target to the target directory.
1. Adding a validation job to the `validation/tests/jobs` directory.

### Testaro rule validation

All Testaro rules have validators, as mentioned above.

The first step in creating a validator is to create at least one HTML file that will be tested against the new rule. A single `index.html` file may suffice. It should contain cases that will pass the test and cases that will fail the test. If appropriate, you can create multiple targets, such as `good.html` and `bad.html`.

The second step is to create a validation job. It launches a browser, navigates to a validation target, and conducts the test. It includes expectations about the results. Typically, the expectations relate to the standard instances included in the results. The `Tests/Expectations` section of the `README.md` file describes the syntax of expectations.

When a rule `xyz` has been defined and the `npm test xyz` statement is executed, the validation job will be run.

### Rule creation

Once you have specified a new rule, you, or somebody else, can develop the rule in accord with your specification. Developing the rule consists of:
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
