const BLOCKED_PATTERNS = [
  /買賣推薦/g,
  /加LINE/gi,
  /加賴/g,
  /詐騙/g,
  /洗錢/g,
  /快速獲利/g,
  /保證獲利/g,
];

export function filterText(text) {
  let result = text;
  for (const pattern of BLOCKED_PATTERNS) {
    result = result.replace(pattern, (m) => '*'.repeat(m.length));
  }
  return result;
}
