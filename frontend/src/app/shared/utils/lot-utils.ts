export function formatLotDisplay(raw?: string): string {
  if (!raw) return '';
  const str = raw.toString().trim();
  // If the raw value is just a number or already in the form 'lot <number>' (any case),
  // normalize to 'Lot <number>' so different variants like 'lot2', '2' or 'Lot 2' appear consistent.
  if (/^\d+$/i.test(str)) {
    return `Lot ${str}`;
  }

  if (/^lot\s*\d+$/i.test(str)) {
    const m = str.match(/(\d+)$/);
    return m ? `Lot ${m[1]}` : (str.charAt(0).toUpperCase() + str.slice(1));
  }

  // Otherwise keep the original name (trimmed) with capitalization preserved for first letter.
  return str.charAt(0).toUpperCase() + str.slice(1);
}
