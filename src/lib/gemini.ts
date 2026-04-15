const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function generateDesignMd(
  apiKey: string,
  extractedStyle: {
    url: string;
    title: string;
    colors: string[];
    fonts: string[];
    cssVariables: Record<string, string>;
  }
): Promise<string> {
  const colors = extractedStyle.colors || [];
  const fonts = extractedStyle.fonts || [];
  const cssVars = extractedStyle.cssVariables || {};

  const prompt = `You are a design system analyst. Analyze the following webpage styles and generate a comprehensive DESIGN.md file following the Stitch format.

## Input Data:
- URL: ${extractedStyle.url}
- Title: ${extractedStyle.title}
- Colors: ${colors.length > 0 ? colors.join(', ') : 'Not detected'}
- Fonts: ${fonts.length > 0 ? fonts.join(', ') : 'Not detected'}
- CSS Variables: ${JSON.stringify(cssVars, null, 2)}

## Required Output Format:
Generate a complete DESIGN.md file with these sections:

# Design System - [Website Name]

## 1. Visual Theme & Atmosphere
[Describe the overall mood, design philosophy, density level]

## 2. Color Palette & Roles
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| [name] | [hex] | [role] |

## 3. Typography Rules
- **Primary Font**: [font family]
- **Fallback**: [fallback]
- **Scale**: [h1-h6 sizes]

## 4. Component Stylings
### Buttons
[Button styles and states]

### Cards
[Card styles]

### Inputs
[Input field styles]

## 5. Layout Principles
- **Grid**: [grid system]
- **Spacing Scale**: [spacing values]
- **Breakpoints**: [responsive breakpoints]

## 6. Depth & Elevation
[Shadow system, borders, dividers]

## 7. Do's and Don'ts
### Do's
- [list of good practices]

### Don'ts
- [list of anti-patterns]

## 8. Responsive Behavior
[Mobile, tablet, desktop considerations]

Please generate ONLY the markdown content without any code fences or explanations.`;

  const fullUrl = `${API_URL}?key=${apiKey}`;
  
  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.error?.status || errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Handle different response formats
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
               data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
               data.response?.text ||
               data.text;
               
  if (!text) {
    console.error('API Response:', JSON.stringify(data, null, 2));
    throw new Error('Invalid response format from Gemini API');
  }

  return text;
}
