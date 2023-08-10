# label-duplicated-content-title

## Rule id

`label-duplicated-content-title`

## Definition

This rule determines if a given element `<label>` contains attribute `title` with the same accessible name.

## Purpose

Let's examine following example:

`<label for="example" title="This is an example">This is an example</label>`

Assuming screen reader can read `title`<sup>*</sup>. In above case then `This is an example` will be read twice. To avoid that this rule helps to find such cases.

`*` - by default, for example, VoiceOver doesn't read `title` until Hints are turned on.

## Test cases

### Passed

The rule passes when there is no `<label>` with an attribute `title` that contains same content as `<label>`'s accessible name.

## WCAG Success Criteria

Not Applicable

## Best Practice

Yes

## User Impact

* **Severity**: info
* **Disabilities Affected**:
  * Visual:
    * blindness
