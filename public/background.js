// Background Service Worker for Chrome Extension

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extract-design-md',
    title: 'Extract DESIGN.md',
    contexts: ['page'],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extract-design-md' && tab?.id) {
    // Open side panel and trigger extraction
    chrome.sidePanel.open({ windowId: tab.windowId });
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_STYLES' });
  }
});

// Handle side panel icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Message handler - relay messages between side panel and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle ping to check if background is ready
  if (message.type === 'PING') {
    sendResponse('PONG');
    return true;
  }

  if (message.type === 'GET_ACTIVE_TAB') {
    // Return the active tab info to side panel
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ tab: tabs[0] });
      } else {
        sendResponse({ error: 'No active tab' });
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'EXTRACT_FROM_TAB') {
    // Side panel requests extraction from a specific tab
    const tabId = message.tabId;
    chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_STYLES' }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response);
      }
    });
    return true;
  }
  
  return false;
});
