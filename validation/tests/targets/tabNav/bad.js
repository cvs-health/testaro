/*
  © 2022–2023 CVS Health and/or one of its affiliates. All rights reserved.

  MIT License

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/*
  bad.js
  Script for validation/tests/targets/tabNav/bad.html.
*/

/*
  UTILITIES FOR EVENT HANDLERS
  Omits handlers for keydown events. Therefore, fails to handle arrow, Home, and End keydown events
  that standardly control the focus among tabs of a tab list.
*/

// Returns the tab list containing a tab.
const allTabs = button => Array.from(button.parentElement.children);
// Returns the panel controlled by a tab.
const controlledPanel = button => document.getElementById(button.getAttribute('aria-controls'));
// Returns the tab panels controlled by the tabs of a tab list.
const allPanels = button => Array.from(controlledPanel(button).parentElement.children);
// Exposes only the tab panel controlled by a button.
const showPanel = button => {
  allPanels(button).forEach(panel => {
    panel.setAttribute('hidden', '');
  });
  controlledPanel(button).removeAttribute('hidden');
};
// Makes a tab active.
const makeActive = button => {
  allTabs(button).forEach(tab => {
    tab.classList.remove('active');
  });
  button.classList.add('active');
};

// EVENT LISTENERS

// Handle tab focusing.
const documentTabs = Array.from(document.body.querySelectorAll('[role=tab]'));
documentTabs.forEach(tab => {
  tab.addEventListener('focus', () => {
    showPanel(tab);
    if (tab.tabIndex !== 0 || ! tab.classList.contains('active')) {
      makeActive(tab);
    }
  });
});
