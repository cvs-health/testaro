# horizontal-rule

## Rule id

`horizontal-rule`

## Definition

This rule determines `<hr/>` elements and gives a tip.

## Purpose

The `<hr/>` element adds extra "noise" and can be confusing. For example VoiceOver reads it as "dimmed collapsed on top, horizontal separator", Windows Narrator reads it as "end of line".

A better option is to replace `<hr/>` with `<div>` and use CSS for styling. Alternatively, `aria-hidden="true"` or `role="presentation"` can be applied to the `<hr/>` element.

## Test cases

### Passed

The rule passes when there are:

* no `<hr/>` elements or
* `<hr/>` use `aria-hidden="true"` or `role="presentation"`

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: info
* **Disabilities Affected**:
  * Visual:
    * blindness
