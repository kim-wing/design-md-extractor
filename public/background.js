// Background Service Worker for Chrome Extension

function createError(code, message, suggestion) {
  return { code, message, suggestion };
}

function isRestrictedUrl(url) {
  return (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('devtools://') ||
    url.startsWith('view-source:')
  );
}

function sendExtractMessage(tabId, sendResponse) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      sendResponse({
        error: createError('tab_lookup_failed', chrome.runtime.lastError.message, 'Reload the extension and try again.'),
      });
      return;
    }

    if (isRestrictedUrl(tab?.url)) {
      sendResponse({
        error: createError(
          'restricted_page',
          'This page does not allow extension script injection.',
          'Open a normal website tab and try again.'
        ),
      });
      return;
    }

    const respondWithExtraction = () => {
      chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_STYLES' }, (response) => {
        if (chrome.runtime.lastError) {
          const message = chrome.runtime.lastError.message || 'Failed to contact content script';

          if (!message.includes('Receiving end does not exist')) {
            sendResponse({
              error: createError(
                'content_script_unavailable',
                message,
                'Reload the tab and try again.'
              ),
            });
            return;
          }

          chrome.scripting.executeScript(
            {
              target: { tabId },
              files: ['content.js'],
            },
            () => {
              if (chrome.runtime.lastError) {
                sendResponse({
                  error: createError(
                    'script_injection_failed',
                    'Failed to inject extraction script into this page.',
                    'Reload the tab and try again.'
                  ),
                });
                return;
              }

              chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_STYLES' }, (retryResponse) => {
                if (chrome.runtime.lastError) {
                  sendResponse({
                    error: createError(
                      'extraction_retry_failed',
                      'Failed to extract styles from this page.',
                      'Reload the tab and try again.'
                    ),
                  });
                } else if (!retryResponse) {
                  sendResponse({
                    error: createError(
                      'no_content_response',
                      'No response from content script.',
                      'Reload the tab and try again.'
                    ),
                  });
                } else if (retryResponse.error) {
                  sendResponse({
                    error: createError(
                      'page_extraction_failed',
                      retryResponse.error,
                      'Wait for the page to finish loading, then try again.'
                    ),
                  });
                } else {
                  sendResponse({ payload: retryResponse });
                }
              });
            }
          );

          return;
        }

        if (!response) {
          sendResponse({
            error: createError(
              'no_content_response',
              'No response from content script.',
              'Reload the tab and try again.'
            ),
          });
        } else if (response.error) {
          sendResponse({
            error: createError(
              'page_extraction_failed',
              response.error,
              'Wait for the page to finish loading, then try again.'
            ),
          });
        } else {
          sendResponse({ payload: response });
        }
      });
    };

    respondWithExtraction();
  });
}

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
    chrome.sidePanel.open({ windowId: tab.windowId }, () => {
      if (chrome.runtime.lastError) {
        return;
      }

      chrome.runtime.sendMessage({
        type: 'TRIGGER_ANALYZE_FROM_CONTEXT_MENU',
        tabId: tab.id,
      });
    });
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
        sendResponse({
          error: createError('no_active_tab', 'No active tab found.', 'Focus a browser tab and try again.'),
        });
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'EXTRACT_FROM_TAB') {
    sendExtractMessage(message.tabId, sendResponse);
    return true;
  }
  
  return false;
});
