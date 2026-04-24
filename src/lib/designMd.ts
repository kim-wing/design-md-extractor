export interface DesignMdFrontMatter {
  [key: string]: unknown;
}

export interface DesignMdExports {
  markdown: string;
  jsonTokens: string;
  compactPrompt: string;
  fullDesignContract: string;
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;

  const numeric = Number(trimmed.replace(/px$/, ''));
  if (!Number.isNaN(numeric) && /^-?\d+(\.\d+)?(px)?$/.test(trimmed)) {
    return trimmed.endsWith('px') ? trimmed : numeric;
  }

  return trimmed.replace(/^['"]|['"]$/g, '');
}

export function parseFrontMatter(markdown: string): DesignMdFrontMatter | null {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  const root: DesignMdFrontMatter = {};
  const stack: Array<{ indent: number; value: Record<string, unknown> }> = [
    { indent: -1, value: root },
  ];

  for (const rawLine of match[1].split('\n')) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) {
      continue;
    }

    const indent = rawLine.match(/^ */)?.[0].length ?? 0;
    const line = rawLine.trim();
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey?.trim();

    if (!key) {
      continue;
    }

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1].value;
    const remainder = rest.join(':').trim();

    if (!remainder) {
      const next: Record<string, unknown> = {};
      current[key] = next;
      stack.push({ indent, value: next });
      continue;
    }

    current[key] = parseScalar(remainder);
  }

  return root;
}

function compactValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}

export function buildCompactPrompt(markdown: string): string {
  const frontMatter = parseFrontMatter(markdown);
  if (!frontMatter) {
    return markdown.trim();
  }

  const lines: string[] = [
    'Use this design contract for UI generation.',
  ];

  const description = frontMatter.description;
  if (description) {
    lines.push(`System: ${compactValue(description)}`);
  }

  const sections = ['colors', 'typography', 'semanticRoles', 'effects', 'constraints', 'responsiveRules', 'components'];
  for (const section of sections) {
    const value = frontMatter[section];
    if (value && typeof value === 'object') {
      lines.push(`${section}: ${JSON.stringify(value)}`);
    }
  }

  lines.push('Follow token values first, then component rules, then prose. Do not invent another visual language.');
  return lines.join('\n');
}

export function buildDesignMdExports(markdown: string): DesignMdExports {
  const frontMatter = parseFrontMatter(markdown);

  return {
    markdown,
    jsonTokens: frontMatter
      ? JSON.stringify(frontMatter, null, 2)
      : JSON.stringify({ error: 'No YAML front matter found in DESIGN.md output.' }, null, 2),
    compactPrompt: buildCompactPrompt(markdown),
    fullDesignContract: markdown,
  };
}
