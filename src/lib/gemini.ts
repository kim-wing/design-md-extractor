const MODEL_NAME = 'gemini-3-flash-preview';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
const REQUEST_TIMEOUT_MS = 30000;

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

  const prompt = `You are a senior design systems architect.
Convert webpage style evidence into an enhanced DESIGN.md optimized for downstream AI UI generation.

Write a design contract, not a loose design summary.

Input Evidence:
- URL: ${extractedStyle.url}
- Title: ${extractedStyle.title}
- Colors: ${colors.length > 0 ? colors.join(', ') : 'Not detected'}
- Fonts: ${fonts.length > 0 ? fonts.join(', ') : 'Not detected'}
- CSS Variables: ${JSON.stringify(cssVars, null, 2)}

Output requirements:
- Output markdown only.
- Start with YAML front matter fenced by ---.
- Include concrete tokens only when supported by evidence.
- Normalize raw values into semantic roles.
- Add explicit constraints to reduce generation drift.
- Keep the markdown body concise and actionable.

YAML groups to use when supported:
- version
- name
- description
- colors
- typography
- rounded
- spacing
- semanticRoles
- effects
- constraints
- responsiveRules
- components

Markdown sections to use in order:
- ## Overview
- ## Colors
- ## Typography
- ## Layout
- ## Elevation & Depth
- ## Shapes
- ## Components
- ## Do's and Don'ts
- ## Prompt Contract

Rules:
- Tokens are authoritative.
- Component tokens override prose.
- Constraints and responsive rules are hard limits.
- Prose only fills gaps.
- Omit weakly supported claims.
- Prefer token references over literal values.
- Prefer 6-14 meaningful color tokens instead of dumping every discovered color.
- Prefer 4-8 meaningful typography tokens instead of listing every variation.
- Only include effects, responsive rules, and component definitions when the evidence supports them.
- Do not dump raw CSS variables directly into the final output.
- Do not output code fences or any explanation outside the DESIGN.md file.

In ## Prompt Contract, state that:
1. YAML token values are normative.
2. Component tokens override general prose for matching UI parts.
3. Constraints and responsive rules are hard limits unless explicitly overridden.
4. Prose fills gaps but must not contradict tokens.`;

  const fullUrl = `${API_URL}?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  let response: Response;
  try {
    response = await fetch(fullUrl, {
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
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Gemini request timed out');
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

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
