# incorrect-technique-for-hiding-content

## Rule id

`incorrect-technique-for-hiding-content`

## Definition

This rule determines if there is defined style `text-indent` with the value so that the element is being positioned out of the viewport.

## Purpose

The technique e.g. `text-indent: -10000px` is still being used to hide the content visually. However, the downside of that technique is that the screen reader focus follows that and it gets out of the visible area.

**Tip**: to avoid that use tecnique that hides the content visually, but does not move the element outside of the visible viewport. Example: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss

## Test cases

### Passed

The rule passes when there is no defined style `text-indent` that hides the content outside of viewport.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: info
* **Disabilities Affected**:
  * Visual:
    * keyboard users
