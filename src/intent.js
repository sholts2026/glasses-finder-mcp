const TERMS = {
  round: ["round face", "round-shaped face"], square: ["square face"], oval: ["oval face"], heart: ["heart face", "heart-shaped face"],
  progressive: ["progressive", "multifocal", "varifocal"], reading: ["reading glasses", "readers"],
  narrow: ["narrow", "small frame"], wide: ["wide", "large frame"],
  lightweight: ["lightweight", "light frame"], bold: ["bold", "statement"], vintage: ["vintage", "retro"],
  classic: ["classic", "timeless"], minimal: ["minimal", "minimalist"], modern: ["modern"], budget: ["budget", "cheap", "affordable"],
  blueLight: ["blue light", "computer glasses", "screen glasses"],
  highPrescription: ["high prescription", "strong prescription", "thick lenses", "high minus", "high plus"],
  computer: ["computer", "office", "screen"], driving: ["driving", "drive"], sport: ["sport", "sports", "running"], sunglasses: ["sunglasses", "sun glasses"],
  lowBridge: ["low bridge", "low nose bridge", "asian fit"], wideBridge: ["wide bridge", "wide nose"], slipping: ["slipping", "slides down", "slide down"], templePressure: ["pressing temples", "tight temples", "hurts temples"]
};

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

function extractBudget(text, fallback = 200) {
  const match = text.match(/(?:under|below|less than|max|budget)\s*\$?(\d{2,4})/i) ?? text.match(/\$(\d{2,4})/);
  return match ? Number(match[1]) : fallback;
}

export function parseFrameSize(value = "") {
  const match = String(value).match(/\b(\d{2})\s*[-/ ]\s*(\d{2})\s*[-/ ]\s*(\d{3})\b/);
  if (!match) return null;
  const [, lensWidth, bridgeWidth, templeLength] = match;
  return {
    raw: match[0],
    lensWidth: Number(lensWidth),
    bridgeWidth: Number(bridgeWidth),
    templeLength: Number(templeLength)
  };
}

function extractFrameSizes(text) {
  return [...text.matchAll(/\b\d{2}\s*[-/ ]\s*\d{2}\s*[-/ ]\s*\d{3}\b/g)].map((match) => parseFrameSize(match[0]));
}

export function parseGlassesIntent(query = "", overrides = {}) {
  const text = query.toLowerCase();
  const faceShape = ["round", "square", "oval", "heart"].find((shape) => includesAny(text, TERMS[shape])) ?? null;
  const frameSizes = extractFrameSizes(text);
  const styles = ["lightweight", "bold", "vintage", "classic", "minimal", "modern", "budget"].filter((style) => includesAny(text, TERMS[style]));
  const useCases = ["computer", "driving", "sport", "sunglasses"].filter((useCase) => includesAny(text, TERMS[useCase]));
  const prescriptionExplicit = Boolean(overrides.prescription) || includesAny(text, TERMS.progressive) || includesAny(text, TERMS.reading) || text.includes("single vision") || text.includes("single-vision");
  return {
    appId: "glasses-finder",
    query,
    budget: overrides.budget ?? extractBudget(text),
    faceShape: overrides.faceShape ?? faceShape,
    prescription: overrides.prescription ?? (includesAny(text, TERMS.progressive) ? "progressive" : includesAny(text, TERMS.reading) ? "reading" : "single_vision"),
    prescriptionExplicit,
    width: overrides.width ?? (includesAny(text, TERMS.narrow) ? "narrow" : includesAny(text, TERMS.wide) ? "wide" : null),
    styles: overrides.styles ?? styles,
    useCases: overrides.useCases ?? useCases,
    blueLight: overrides.blueLight ?? includesAny(text, TERMS.blueLight),
    highPrescription: overrides.highPrescription ?? includesAny(text, TERMS.highPrescription),
    bridgeFit: overrides.bridgeFit ?? (includesAny(text, TERMS.lowBridge) ? "low_bridge" : includesAny(text, TERMS.wideBridge) ? "wide_bridge" : null),
    fitProblem: overrides.fitProblem ?? (includesAny(text, TERMS.slipping) ? "slipping" : includesAny(text, TERMS.templePressure) ? "temple_pressure" : null),
    currentFrameSize: parseFrameSize(overrides.currentFrameSize) ?? frameSizes[0] ?? null,
    comparedFrameSize: parseFrameSize(overrides.comparedFrameSize) ?? frameSizes[1] ?? null,
    disclaimers: ["Shopping guidance only. Confirm prescription, pupillary distance, measurements, lens options, and final price with the merchant or an eye-care professional."]
  };
}
