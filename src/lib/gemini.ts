const PRIMARY_MODEL_NAME = 'gemini-2.5-flash';
const FALLBACK_MODEL_NAME = 'gemini-2.5-flash-lite';
const REQUEST_TIMEOUT_MS = 60000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class DesignMdGenerationError extends Error {
  code: string;
  suggestion?: string;

  constructor(code: string, message: string, suggestion?: string) {
    super(message);
    this.name = 'DesignMdGenerationError';
    this.code = code;
    this.suggestion = suggestion;
  }
}

function buildApiUrl(modelName: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isHighDemandMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('high demand') ||
    normalized.includes('try again later') ||
    normalized.includes('resource exhausted') ||
    normalized.includes('quota exceeded')
  );
}

function limitArray<T>(items: T[], limit: number): T[] {
  return items.slice(0, limit);
}

function compactRecord(
  record: Record<string, string>,
  limit: number
): Record<string, string> {
  return Object.fromEntries(Object.entries(record).slice(0, limit));
}

function compactComponentSamples(
  samples: Array<Record<string, string>>,
  limit: number
): Array<Record<string, string>> {
  return samples.slice(0, limit).map((sample) => ({
    backgroundColor: sample.backgroundColor,
    textColor: sample.textColor,
    borderColor: sample.borderColor,
    borderRadius: sample.borderRadius,
    boxShadow: sample.boxShadow,
    fontFamily: sample.fontFamily,
    fontSize: sample.fontSize,
    fontWeight: sample.fontWeight,
    padding: sample.padding,
  }));
}

export async function generateDesignMd(
  apiKey: string,
  extractedStyle: {
    url: string;
    title: string;
    colors: string[];
    fonts: string[];
    cssVariables: Record<string, string>;
    spacingScale: string[];
    borderRadiusScale: string[];
    shadowStyles: string[];
    layoutHints: {
      maxWidthCandidates: string[];
      gapScale: string[];
    };
    buttons: Array<Record<string, string>>;
    inputs: Array<Record<string, string>>;
    surfaces: Array<Record<string, string>>;
  }
): Promise<string> {
  const colors = limitArray(extractedStyle.colors || [], 12);
  const fonts = limitArray(extractedStyle.fonts || [], 8);
  const cssVars = compactRecord(extractedStyle.cssVariables || {}, 30);
  const spacingScale = limitArray(extractedStyle.spacingScale || [], 8);
  const borderRadiusScale = limitArray(extractedStyle.borderRadiusScale || [], 6);
  const shadowStyles = limitArray(extractedStyle.shadowStyles || [], 4);
  const layoutHints = {
    maxWidthCandidates: limitArray(
      extractedStyle.layoutHints?.maxWidthCandidates || [],
      4
    ),
    gapScale: limitArray(extractedStyle.layoutHints?.gapScale || [], 6),
  };
  const buttons = compactComponentSamples(extractedStyle.buttons || [], 2);
  const inputs = compactComponentSamples(extractedStyle.inputs || [], 2);
  const surfaces = compactComponentSamples(extractedStyle.surfaces || [], 2);

  const prompt = `You are a senior design systems architect.
Convert webpage style evidence into an enhanced DESIGN.md optimized for downstream AI UI generation.

Write a design contract, not a loose design summary.

Input Evidence:
- URL: ${extractedStyle.url}
- Title: ${extractedStyle.title}
- Colors: ${colors.length > 0 ? colors.join(', ') : 'Not detected'}
- Fonts: ${fonts.length > 0 ? fonts.join(', ') : 'Not detected'}
- CSS Variables: ${JSON.stringify(cssVars, null, 2)}
- Spacing Scale: ${spacingScale.length > 0 ? spacingScale.join(', ') : 'Not detected'}
- Border Radius Scale: ${borderRadiusScale.length > 0 ? borderRadiusScale.join(', ') : 'Not detected'}
- Shadow Styles: ${shadowStyles.length > 0 ? shadowStyles.join(' | ') : 'Not detected'}
- Layout Hints: ${JSON.stringify(layoutHints, null, 2)}
- Button Samples: ${JSON.stringify(buttons, null, 2)}
- Input Samples: ${JSON.stringify(inputs, null, 2)}
- Surface Samples: ${JSON.stringify(surfaces, null, 2)}

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
- Use spacing, radius, shadow, and sampled component evidence to infer reusable scales.
- Infer layout density and container width only when the layout hints support it.
- Only include effects, responsive rules, and component definitions when the evidence supports them.
- Do not dump raw CSS variables directly into the final output.
- Do not output code fences or any explanation outside the DESIGN.md file.

In ## Prompt Contract, state that:
1. YAML token values are normative.
2. Component tokens override general prose for matching UI parts.
3. Constraints and responsive rules are hard limits unless explicitly overridden.
4. Prose fills gaps but must not contradict tokens.`;

  const requestBody = {
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
      maxOutputTokens: 4096,
      temperature: 0.3,
    },
  };

  const runModel = async (
    modelName: string,
    maxAttempts: number
  ): Promise<string> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(buildApiUrl(modelName, apiKey), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } catch (error) {
        window.clearTimeout(timeoutId);

        if (error instanceof DOMException && error.name === 'AbortError') {
          if (attempt < maxAttempts) {
            await sleep(1200 * attempt);
            continue;
          }

          throw new DesignMdGenerationError(
            'api_timeout',
            'Gemini request timed out.',
            'Check your network connection and try again.'
          );
        }

        throw error;
      }

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        let errorCode = 'api_request_failed';
        let suggestion = 'Check your API key and try again.';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.error?.status || errorMessage;
        } catch {
          // ignore parse error
        }

        if (response.status === 400 || response.status === 403) {
          errorCode = 'api_key_invalid';
          suggestion = 'Verify your Gemini API key in Settings.';
        } else if (RETRYABLE_STATUS_CODES.has(response.status) || isHighDemandMessage(errorMessage)) {
          errorCode = 'api_high_demand';
          suggestion = 'Gemini is unavailable right now. Try again in a minute.';

          if (attempt < maxAttempts) {
            await sleep(1500 * attempt);
            continue;
          }
        } else if (response.status >= 500) {
          suggestion = 'Gemini is unavailable right now. Try again in a minute.';
        }

        throw new DesignMdGenerationError(errorCode, errorMessage, suggestion);
      }

      const data = await response.json();

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
        data.response?.text ||
        data.text;

      if (!text) {
        console.error('API Response:', JSON.stringify(data, null, 2));
        throw new DesignMdGenerationError(
          'invalid_api_response',
          'Invalid response format from Gemini API.',
          'Try again. If it keeps failing, switch models or reduce the prompt scope.'
        );
      }

      return text;
    }

    throw new DesignMdGenerationError(
      'api_high_demand',
      'Gemini is currently unavailable due to high demand.',
      'Try again in a minute.'
    );
  };

  try {
    return await runModel(PRIMARY_MODEL_NAME, 2);
  } catch (error) {
    if (
      error instanceof DesignMdGenerationError &&
      (error.code === 'api_high_demand' || error.code === 'api_timeout')
    ) {
      return runModel(FALLBACK_MODEL_NAME, 2);
    }

    throw error;
  }
}
