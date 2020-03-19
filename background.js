  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#f00'}, function() {
      console.log("The color is green.");
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules(
        [{
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {hostEquals: 'github.com', schemes: ['https']},
            })
          ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
        }]
      );
    });
  });

