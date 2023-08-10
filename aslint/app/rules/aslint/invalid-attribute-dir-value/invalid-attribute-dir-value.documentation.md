# invalid-attribute-dir-value

## Rule id

`invalid-attribute-dir-value`

## Definition

This rule determines if a given attribute `dir` have the correct value: `rtl`, `ltr` or `auto`.

## Purpose

The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. To avoid unexpected behaviour the value of `dir` should be correct and should contains one of following string: `rtl`, `ltr` or `auto`.

## Test cases

### Passed

The rule passes when there is no `dir` attribute with value other than `rtl`, `ltr` or `auto`.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: info
* **Disabilities Affected**:
  * Visual:
    * blindness
