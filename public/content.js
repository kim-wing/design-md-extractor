// Content Script - Extract page styles

function toHex(color) {
  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/);
  if (!rgbMatch) {
    return color;
  }

  const channels = rgbMatch[1]
    .split(',')
    .slice(0, 3)
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value));

  if (channels.length !== 3) {
    return color;
  }

  return `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function normalizeColor(color) {
  const trimmed = color.trim();
  if (trimmed.startsWith('rgb')) {
    return toHex(trimmed).toUpperCase();
  }
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed)) {
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toUpperCase();
    }
    return trimmed.toUpperCase();
  }
  return trimmed;
}

function getPxValue(value) {
  const match = String(value).match(/-?\d+(\.\d+)?/);
  if (!match) {
    return null;
  }

  const numeric = Number.parseFloat(match[0]);
  return Number.isFinite(numeric) ? Math.round(numeric) : null;
}

function getTopEntries(counter, limit) {
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function incrementCounter(counter, value) {
  counter.set(value, (counter.get(value) || 0) + 1);
}

function isValidColor(color) {
  if (!color || color === 'transparent' || color === 'inherit' || color === 'initial') {
    return false;
  }
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
         /^rgb\(/.test(color) ||
         /^hsl\(/.test(color);
}

function getUniqueColors(elements) {
  const colorCounter = new Map();

  elements.slice(0, 400).forEach((el) => {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const color = style.color;
    
    if (isValidColor(bgColor)) incrementCounter(colorCounter, normalizeColor(bgColor));
    if (isValidColor(color)) incrementCounter(colorCounter, normalizeColor(color));
    
    const borderColor = style.borderColor;
    if (isValidColor(borderColor)) incrementCounter(colorCounter, normalizeColor(borderColor));
  });
  
  return getTopEntries(colorCounter, 20);
}

function getUniqueFonts(elements) {
  const fontCounter = new Map();

  elements.slice(0, 400).forEach((el) => {
    const style = window.getComputedStyle(el);
    const fontFamily = style.fontFamily;
    if (fontFamily && fontFamily !== 'inherit') {
      incrementCounter(fontCounter, fontFamily);
    }
  });
  
  return getTopEntries(fontCounter, 10);
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

function collectScale(elements, styleKeys, maxValue) {
  const counter = new Map();

  elements.slice(0, 400).forEach((el) => {
    const style = window.getComputedStyle(el);
    styleKeys.forEach((key) => {
      const numeric = getPxValue(style[key]);
      if (numeric && numeric > 0 && numeric <= maxValue) {
        incrementCounter(counter, `${numeric}px`);
      }
    });
  });

  return getTopEntries(counter, 8);
}

function summarizeStyle(style) {
  return {
    backgroundColor: isValidColor(style.backgroundColor) ? normalizeColor(style.backgroundColor) : 'transparent',
    textColor: isValidColor(style.color) ? normalizeColor(style.color) : 'inherit',
    borderColor: isValidColor(style.borderColor) ? normalizeColor(style.borderColor) : 'transparent',
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
  };
}

function summarizeTypography(style) {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textTransform: style.textTransform,
  };
}

function collectTypographyScale() {
  const selectors = [
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'li',
    'a',
    'button',
    'label',
    '[class*="title"]',
    '[class*="heading"]',
    '[class*="headline"]',
  ];
  const counter = new Map();

  Array.from(document.body.querySelectorAll(selectors.join(',')))
    .slice(0, 160)
    .forEach((el) => {
      const style = window.getComputedStyle(el);
      const size = getPxValue(style.fontSize);

      if (!size || size < 10 || size > 96) {
        return;
      }

      const tagName = el.tagName.toLowerCase();
      const role = ['h1', 'h2', 'h3', 'h4'].includes(tagName)
        ? tagName
        : tagName === 'button' || el.getAttribute('role') === 'button'
          ? 'control'
          : tagName === 'label'
            ? 'label'
            : 'body';
      const summary = {
        role,
        ...summarizeTypography(style),
      };

      incrementCounter(counter, JSON.stringify(summary));
    });

  return getTopEntries(counter, 8).map((entry) => JSON.parse(entry));
}

function collectComponentSummaries(selectors, limit) {
  return Array.from(document.querySelectorAll(selectors))
    .slice(0, limit)
    .map((element) => summarizeStyle(window.getComputedStyle(element)))
    .filter((style, index, styles) =>
      styles.findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(style)) === index
    )
    .slice(0, 4);
}

function collectNavigationSummaries() {
  return collectComponentSummaries('header, nav, [role="navigation"], [class*="nav"], [class*="menu"]', 10);
}

function collectImageTreatment(elements) {
  const counter = new Map();

  Array.from(document.querySelectorAll('img, video, picture, [class*="media"], [class*="hero"]'))
    .slice(0, 80)
    .forEach((el) => {
      const style = window.getComputedStyle(el);
      const radius = style.borderRadius;
      const objectFit = style.objectFit;
      const aspectRatio = style.aspectRatio;
      const boxShadow = style.boxShadow;
      const overflow = style.overflow;
      const summary = JSON.stringify({
        borderRadius: radius,
        objectFit,
        aspectRatio,
        boxShadow,
        overflow,
      });
      incrementCounter(counter, summary);
    });

  if (counter.size === 0) {
    elements.slice(0, 120).forEach((el) => {
      const style = window.getComputedStyle(el);
      const backgroundImage = style.backgroundImage;
      if (backgroundImage && backgroundImage !== 'none') {
        incrementCounter(counter, JSON.stringify({
          backgroundSize: style.backgroundSize,
          backgroundPosition: style.backgroundPosition,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
        }));
      }
    });
  }

  return getTopEntries(counter, 5).map((entry) => JSON.parse(entry));
}

function collectMotionStyles(elements) {
  const counter = new Map();

  elements.slice(0, 250).forEach((el) => {
    const style = window.getComputedStyle(el);
    const transition = style.transition;
    const animation = style.animationName && style.animationName !== 'none'
      ? `${style.animationName} ${style.animationDuration} ${style.animationTimingFunction}`
      : '';

    if (transition && transition !== 'all 0s ease 0s') {
      incrementCounter(counter, transition);
    }

    if (animation) {
      incrementCounter(counter, animation);
    }
  });

  return getTopEntries(counter, 6);
}

function extractLayoutHints(elements) {
  const widthCounter = new Map();
  const gapCounter = new Map();

  elements.slice(0, 250).forEach((el) => {
    const style = window.getComputedStyle(el);
    const maxWidth = getPxValue(style.maxWidth);
    const gap = getPxValue(style.gap) || getPxValue(style.columnGap) || getPxValue(style.rowGap);

    if (maxWidth && maxWidth >= 320 && maxWidth <= 1600) {
      incrementCounter(widthCounter, `${maxWidth}px`);
    }

    if (gap && gap <= 120) {
      incrementCounter(gapCounter, `${gap}px`);
    }
  });

  return {
    maxWidthCandidates: getTopEntries(widthCounter, 5),
    gapScale: getTopEntries(gapCounter, 6),
  };
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
    typographyScale: collectTypographyScale(),
    spacingScale: collectScale(elements, [
      'marginTop',
      'marginBottom',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'gap',
      'rowGap',
      'columnGap',
    ], 160),
    borderRadiusScale: collectScale(elements, [
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
    ], 80),
    shadowStyles: getTopEntries(
      Array.from(elements.slice(0, 250)).reduce((counter, el) => {
        const boxShadow = window.getComputedStyle(el).boxShadow;
        if (boxShadow && boxShadow !== 'none') {
          incrementCounter(counter, boxShadow);
        }
        return counter;
      }, new Map()),
      6
    ),
    layoutHints: extractLayoutHints(elements),
    buttons: collectComponentSummaries('button, [role="button"], input[type="button"], input[type="submit"], a[class*="button"]', 12),
    inputs: collectComponentSummaries('input, textarea, select', 12),
    surfaces: collectComponentSummaries('main, section, article, aside, nav, [class*="card"], [class*="panel"]', 16),
    navigation: collectNavigationSummaries(),
    imageTreatment: collectImageTreatment(elements),
    motionStyles: collectMotionStyles(elements),
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
