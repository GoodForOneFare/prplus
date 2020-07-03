/* global chrome */
const buttons = document.querySelectorAll('button');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function ([tab]) {
      chrome.tabs.sendMessage(tab.id, {type: button.id}, function () {});
    });
  });
});
