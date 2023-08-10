# content-editable-missing-attributes

## Rule id

`content-editable-missing-attributes`

## Definition

This rule verifies if element with attribute `contenteditable` have defined also following attributes:

1. `aria-multiline`
2. `aria-labelledby` or `aria-label`

## Purpose

When `aria-multiline="true"` is set then Assistive Technologies informs the user that the textbox supports multi-line input, with the expectation that <kbd>Enter</kbd> or <kbd>Return</kbd> will create a line break rather than submitting the form.

`aria-label` here is recommended to specify a string to be used as the accessible label.

Eventually `aria-labelledby` can be used to specify the `id` of another element in the DOM as an element's label.

## Test cases

### Passed

The rule passes when all of the following cases are fulfilled:

1. Attribute `contenteditable` is defined.
2. `aria-label` or `aria-labelledby` is defined. The rule does not validate `aria-labelledby` ids if the referenced elements exists.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: high
* **Disabilities Affected**:
  * Visual:
    * blindness

## Resources

Not available
