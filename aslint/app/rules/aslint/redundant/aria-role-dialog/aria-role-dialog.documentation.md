# aria-role-dialog

## Rule id

`aria-role-dialog`

## Definition

Ensures that element with attribute `role="dialog"` is having defined an accessible name.

## Purpose

Using `role="dialog"` on the HTML element helps assistive technology identify the dialog's content as being grouped and separated from the rest of the page content. However, having only `role="dialog"` defined alone is not sufficient to make a dialog accessible. Additionally, the following needs to be done:

1. The dialog must be properly labeled
2. Keyboard focus must be managed correctly

`aria-role-dialog` rule test cases below describe how #1 requirement can be met.

**Note**: when possible you may consider using native [&lt;dialog&gt;](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) box feature.

## Test cases

### Passed

The rule passes when one of the following case is fulfilled:

1. Attribute `aria-labelledby` is defined AND is not empty.
2. Attribute `aria-label` is defined AND is not empty.
2. Attribute `title` is defined AND is not empty.

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
