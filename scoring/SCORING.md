# Autotest scoring

Accessibility test automation

## Introduction

The basics of scoring in Autotest are described in the `README.md` file.

Scoring procs are located in the `procs/score` directory.

This document describes the current version of the most comprehensive scoring proc.

## Proc

The proc documented here is `p03c13`.

## Tests

The tests in `p03c13` are:
- Packages
   - Axe
   - IBM Equal Access Accessibility Checker
   - WAVE
- Autotest tests
   - bulk
   - embAc
   - focInd
   - focOl
   - focOp
   - hover
   - labClash
   - linkUl
   - log
   - motion
   - radioSet
   - role
   - styleDiff

## Strategy

The `p03c13` proc computes a deficit score. The greater the score, the worse the artifact is deemed to be.

The total score is the sum of the scores produced by the individual tests.

Some documents are implemented in such a way that some tests are prevented from being conducted on them. When that occurs, the proc **infers** a score. If the test is a package test, the inferred score is the mean of the scores produced by the package tests that were successfully conducted, if any, or a fixed number if they all failed, plus a fixed number. If the test is an Autotest test, the inferred score is a fixed number. The inferred scores are intended to combine an estimate of a likely score and a penalty for imposing a barrier to test conduct.

The scoring is intended to estimate the over-all inaccessibility of a document. Inaccessibility is understood to arise from design and implementation facts that fail to conform to accessibility standards and/or best practices.

As the proc is applied, cases are discovered in which the proc appears to understate or exaggerate inaccessibilities, and revisions are made to improve the similarity between its scores and expert judgments.

## Formulas

When a script commands Autotest to compute scores with this proc, the report from the script execution includes an act with type `score`. Its `result.rules` property provides summaries of the formulas.

The exact calculations producing the test scores are located in the individual test modules, which are in the `tests` directory.
