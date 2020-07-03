// let changeColor = document.getElementById('changeColor');
const buttons = document.querySelectorAll('button');

// Mark all svg files as viewed
// x = $$(".file a[title$=svg]").forEach((svg) => { const check = svg.closest('.file').querySelector('.js-reviewed-checkbox:not(:checked)'); if (check) { check.click(); } })

// Remove all svg files from DOM
// x = $$(".file a[title$=svg]").forEach((svg) => { const file = svg.closest('.file'); file.remove() })

// Collapse all test files
// x = $$(".file a[title$=\\.test\\.ts], .file a[title$=\\.test\\.tsx]").map((link) => link.closest('.file').querySelector('[aria-expanded=true]')).filter(Boolean).forEach((collapseButton) => collapseButton.click())

// Collapse JSON files
// x = $$(".file a[title$=\\.json]").map((link) => link.closest('.file').querySelector('[aria-expanded=true]')).filter(Boolean).forEach((collapseButton) => collapseButton.click())

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function ([tab]) {
      chrome.tabs.sendMessage(tab.id, {type: button.id}, function (
        response,
      ) {});
    });
  });
});

// // chrome.storage.sync.get('color', function(data) {
// //   // changeColor.style.backgroundColor = data.color;
// //   // changeColor.setAttribute('value', data.color);
// // });
