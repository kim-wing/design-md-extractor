export interface ExtractedStyle {
  url: string;
  title: string;
  colors: string[];
  fonts: string[];
  cssVariables: Record<string, string>;
  computedStyles: Record<string, string>;
}

function isValidColor(color: string): boolean {
  if (!color || color === 'transparent' || color === 'inherit' || color === 'initial') {
    return false;
  }
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
         /^rgb\(/.test(color) ||
         /^hsl\(/.test(color);
}

function getUniqueColors(elements: Element[]): string[] {
  const colorSet = new Set<string>();
  
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const color = style.color;
    
    if (isValidColor(bgColor)) colorSet.add(bgColor);
    if (isValidColor(color)) colorSet.add(color);
    
    // Check border colors
    const borderColor = style.borderColor;
    if (isValidColor(borderColor)) colorSet.add(borderColor);
  });
  
  return Array.from(colorSet).slice(0, 20);
}

function getUniqueFonts(elements: Element[]): string[] {
  const fontSet = new Set<string>();
  
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const fontFamily = style.fontFamily;
    if (fontFamily && fontFamily !== 'inherit') {
      fontSet.add(fontFamily);
    }
  });
  
  return Array.from(fontSet).slice(0, 10);
}

function extractCssVariables(): Record<string, string> {
  const variables: Record<string, string> = {};
  
  document.querySelectorAll('style').forEach((styleEl) => {
    const cssText = styleEl.textContent || '';
    const varMatches = cssText.match(/--[\w-]+:\s*[^;]+/g);
    
    varMatches?.forEach((match) => {
      const [key, value] = match.split(':').map((s) => s.trim());
      if (key && value) {
        variables[key] = value;
      }
    });
  });
  
  return variables;
}

export function extractPageStyles(): ExtractedStyle {
  const allElements = document.querySelectorAll('*');
  const bodyElements = Array.from(document.body.querySelectorAll('*'));
  
  const title = document.title || 'Unknown Page';
  const url = window.location.href;
  
  return {
    url,
    title,
    colors: getUniqueColors(bodyElements),
    fonts: getUniqueFonts(bodyElements),
    cssVariables: extractCssVariables(),
    computedStyles: {},
  };
}
