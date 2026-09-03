const TERMS = {
  round: ["round face", "round-shaped face"], square: ["square face"], oval: ["oval face"], heart: ["heart face", "heart-shaped face"],
  progressive: ["progressive", "multifocal", "varifocal"], reading: ["reading glasses", "readers"],
  narrow: ["narrow", "small frame"], wide: ["wide", "large frame"],
  lightweight: ["lightweight", "light frame"], bold: ["bold", "statement"], vintage: ["vintage", "retro"],
  blueLight: ["blue light", "computer glasses", "screen glasses"]
};

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

function extractBudget(text, fallback = 200) {
  const match = text.match(/(?:under|below|less than|max|budget)\s*\$?(\d{2,4})/i) ?? text.match(/\$(\d{2,4})/);
  return match ? Number(match[1]) : fallback;
}

export function parseGlassesIntent(query = "", overrides = {}) {
  const text = query.toLowerCase();
  const faceShape = ["round", "square", "oval", "heart"].find((shape) => includesAny(text, TERMS[shape])) ?? null;
  return {
    appId: "glasses-finder",
    query,
    budget: overrides.budget ?? extractBudget(text),
    faceShape: overrides.faceShape ?? faceShape,
    prescription: overrides.prescription ?? (includesAny(text, TERMS.progressive) ? "progressive" : includesAny(text, TERMS.reading) ? "reading" : "single_vision"),
    width: overrides.width ?? (includesAny(text, TERMS.narrow) ? "narrow" : includesAny(text, TERMS.wide) ? "wide" : null),
    styles: overrides.styles ?? ["lightweight", "bold", "vintage"].filter((style) => includesAny(text, TERMS[style])),
    blueLight: overrides.blueLight ?? includesAny(text, TERMS.blueLight),
    disclaimers: ["Shopping guidance only. Confirm prescription, pupillary distance, measurements, lens options, and final price with the merchant or an eye-care professional."]
  };
}
