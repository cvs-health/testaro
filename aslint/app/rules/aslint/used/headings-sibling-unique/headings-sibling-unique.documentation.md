# headings-sibling-unique

## Rule id

`headings-sibling-unique`

## Definition

This rule verifies if the accessible names of sibling heading elements of the same level are unique.

## Purpose

If section headings that share the same parent heading are not unique, users of assistive technologies will not be able to discern the differences among sibling sections of the web page.

This rule checks 1 case:

* Sibling headings accessible names must be unique.

### Example

#### Incorrect

    <h2>Example</h2>
    <h2>Example</h2>

#### Correct

    <h2>Example 1</h2>
    <h2>Example 2</h2>


## Test cases

### Passed

The rule passes when sibiling headings are having unique accessible name.

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

* http://www.w3.org/TR/WCAG20/#navigation-mechanisms-descriptive
* http://www.w3.org/TR/WCAG20-TECHS/G130
* https://www.w3.org/TR/WCAG20-TECHS/G141.html
