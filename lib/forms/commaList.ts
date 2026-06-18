export function parseCommaList(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatCommaList(items: string[]): string {
  return items.join(', ');
}

export function commaListsMatch(raw: string, items: string[]): boolean {
  return parseCommaList(raw).join('\u0000') === items.join('\u0000');
}

export function mergeUniqueTags(existing: string[], incoming: string[]): string[] {
  const next = [...existing];
  incoming.forEach((item) => {
    const trimmed = item.trim();
    if (trimmed && !next.includes(trimmed)) {
      next.push(trimmed);
    }
  });
  return next;
}
