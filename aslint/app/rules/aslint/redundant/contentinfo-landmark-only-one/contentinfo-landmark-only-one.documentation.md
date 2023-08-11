# contentinfo-landmark-only-one

## Rule id

`contentinfo-landmark-only-one`

## Definition

This rule verifies if there is no more than 1 element with an attribute `role="contentinfo"`.

## Purpose

Based on https://www.w3.org/TR/wai-aria/#contentinfo

> Within any document or application, the author SHOULD mark no more than one element with the contentinfo role.


## Test cases

### Passed

The rule passes when all of the following cases are fulfilled:

1. There is no more than 1 element with an attribute `role="contentinfo"`

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: low
* **Disabilities Affected**:
  * Visual:
    * blindness

## Resources

* https://www.w3.org/TR/wai-aria/#contentinfo
* http://www.w3.org/TR/WCAG20-TECHS/ARIA11

