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

  elements.slice(0, 400).forEach((el) => {
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

  elements.slice(0, 400).forEach((el) => {
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

  const rootStyle = window.getComputedStyle(document.documentElement);
  Array.from(rootStyle).forEach((propertyName) => {
    if (!propertyName.startsWith('--')) {
      return;
    }

    const value = rootStyle.getPropertyValue(propertyName).trim();
    if (value) {
      variables[propertyName] = value;
    }
  });

  return variables;
}

function extractPageStyles() {
  if (!document.body) {
    throw new Error('Page is not ready for extraction');
  }

  const selectors = [
    'button',
    'a',
    'input',
    'textarea',
    'select',
    'header',
    'nav',
    'main',
    'section',
    'article',
    'aside',
    'footer',
    '[class]',
  ];
  const sampledElements = Array.from(
    document.body.querySelectorAll(selectors.join(','))
  );
  const elements = sampledElements.length > 0
    ? sampledElements
    : Array.from(document.body.querySelectorAll('*'));
  
  const title = document.title || 'Unknown Page';
  const url = window.location.href;
  
  return {
    url,
    title,
    colors: getUniqueColors(elements),
    fonts: getUniqueFonts(elements),
    cssVariables: extractCssVariables(),
  };
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_STYLES') {
    try {
      const styles = extractPageStyles();
      sendResponse(styles);
    } catch (error) {
      sendResponse({
        error: error instanceof Error ? error.message : 'Extraction failed',
      });
    }
  }
  return true;
});
