// UTILITIES FOR EVENT HANDLERS

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
