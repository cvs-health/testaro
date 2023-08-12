# flash-content

## Rule id

`flash-content`

## Definition

This rule verifies if there are Adobe Flash Player components.

## Purpose

> Since Adobe no longer supports Flash Player after December 31, 2020 and blocked Flash content from running in Flash Player beginning January 12, 2021, Adobe strongly recommends all users immediately uninstall Flash Player to help protect their systems.

Source: https://www.adobe.com/products/flashplayer/end-of-life.html

Due to above security reasons and poor an accessibility support Adobe Flash player should be removed.

Following elements are being considered as Adobe Flash Player while evaluating this rule:

CSS selector:

    [classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"], embed[type="application/x-shockwave-flash"], object[type="application/x-shockwave-flash"]

## Test cases

### Passed

The rule passes when there are no elements that refers to Adobe Flash Player.

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

* https://www.adobe.com/products/flashplayer/end-of-life.html
