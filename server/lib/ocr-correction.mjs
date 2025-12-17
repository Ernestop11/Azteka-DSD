const COMMON_GLYPH_MAP = new Map([
  ['§', 'S'],
  ['$', 'S'],
  ['0', 'O'],
  ['1', 'I'],
  ['¡', 'I'],
  ['™', 'TM'],
]);

export function correctOcrArtifacts(value) {
  if (!value) {
    return '';
  }

  let output = String(value)
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  COMMON_GLYPH_MAP.forEach((replacement, glyph) => {
    const regex = new RegExp(glyph, 'g');
    output = output.replace(regex, replacement);
  });

  return output;
}

