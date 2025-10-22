chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.title === "RR Dedicated manager") {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });
    // Send message to content script with the updated state
    chrome.tabs.sendMessage(tab.id, { type: 'STATE_UPDATE', state: nextState });

    // functions
    function boChromeOff() { console.log("BOchrome has been turned OFF!") }
    function getTitle() { return document.title; }

    if (nextState === "ON") {
      // Insert script when the user turns the extension on
      await chrome.scripting.executeScript({
        target : { tabId : tab.id, allFrames : true },
        files : [ "script.js" ],
      }).then(() => console.log("injected script file"));
      // Insert the CSS file when the user turns the extension on
      await chrome.scripting.insertCSS({
        files: ["style.css"],
        target: { tabId: tab.id },
      });
    } else if (nextState === "OFF") {
      // Extension off
      await chrome.scripting.executeScript({
        target : { tabId : tab.id, allFrames : true },
        func : boChromeOff,
      }).then(() => console.log("injected a function"))
      // Remove the CSS file when the user turns the extension off
      await chrome.scripting.removeCSS({
        files: ["style.css"],
        target: { tabId: tab.id },
      });
    }
  }
});