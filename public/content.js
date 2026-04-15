// Content Script - Extract page styles

function isValidColor(color) {
  if (!color || color === 'transparent' || color === 'inherit' || color === 'initial') {
    return false;
  }
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
         /^rgb\(/.test(color) ||
         /^hsl\(/.test(color);
}

function getUniqueColors(elements) {
  const colorSet = new Set();
  
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const color = style.color;
    
    if (isValidColor(bgColor)) colorSet.add(bgColor);
    if (isValidColor(color)) colorSet.add(color);
    
    const borderColor = style.borderColor;
    if (isValidColor(borderColor)) colorSet.add(borderColor);
  });
  
  return Array.from(colorSet).slice(0, 20);
}

function getUniqueFonts(elements) {
  const fontSet = new Set();
  
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const fontFamily = style.fontFamily;
    if (fontFamily && fontFamily !== 'inherit') {
      fontSet.add(fontFamily);
    }
  });
  
  return Array.from(fontSet).slice(0, 10);
}

function extractCssVariables() {
  const variables = {};
  
  document.querySelectorAll('style').forEach((styleEl) => {
    const cssText = styleEl.textContent || '';
    const varMatches = cssText.match(/--[\w-]+:\s*[^;]+/g);
    
    varMatches?.forEach((match) => {
      const parts = match.split(':').map((s) => s.trim());
      const key = parts[0];
      const value = parts.slice(1).join(':');
      if (key && value) {
        variables[key] = value;
      }
    });
  });
  
  return variables;
}

function extractPageStyles() {
  const bodyElements = Array.from(document.body.querySelectorAll('*'));
  
  const title = document.title || 'Unknown Page';
  const url = window.location.href;
  
  return {
    url,
    title,
    colors: getUniqueColors(bodyElements),
    fonts: getUniqueFonts(bodyElements),
    cssVariables: extractCssVariables(),
  };
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_STYLES') {
    const styles = extractPageStyles();
    sendResponse(styles);
  }
  return true;
});
