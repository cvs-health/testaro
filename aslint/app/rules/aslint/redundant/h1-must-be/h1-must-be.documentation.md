# h1-must-be

## Rule id

`h1-must-be`

## Definition

This rule verifies if there is defined heading `h1` on the page.

## Purpose

Most content on web pages should be organized into sections. When pages are organized into sections, a heading should be present.

All pages should at least have a `<h1>` level heading giving the title of the page.

This rule checks 1 case:

* Determine if there is at least 1 element `<h1>`.

**Note**: the rule does not check if the content of `<h1>` is empty.

## Test cases

### Passed

The rule passes when there is at least 1 `<h1>` element.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: critical
* **Disabilities Affected**:
  * Visual:
    * blindness

## Resources

* https://www.w3.org/WAI/tutorials/page-structure/headings/
