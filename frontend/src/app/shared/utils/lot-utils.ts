export function formatLotDisplay(raw?: string): string {
  if (!raw) return '';
  let str = raw.toString().trim();
  // Remove any occurrence of the word 'lot' (case-insensitive) first to avoid duplicates
  str = str.replace(/\blot\b/gi, '').trim().replace(/\s+/g, ' ');
  
  // If the raw value is just a number or contains a number, normalize to 'Lot <number>'
  if (/^\d+$/i.test(str)) {
    return `Lot ${str}`;
  }

  const numberMatch = str.match(/(\d+)$/);
  if (numberMatch) {
    return `Lot ${numberMatch[1]}`;
  }

  // Otherwise keep the original name (trimmed) with capitalization preserved for first letter.
  return str.charAt(0).toUpperCase() + str.slice(1);
}
