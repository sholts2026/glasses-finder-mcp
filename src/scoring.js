const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

const FACE_SHAPE_GUIDANCE = {
  round: "slightly more angular frame geometry can add definition to a round face",
  square: "rounder or softened frame geometry can balance a square face",
  oval: "oval faces usually have a wide frame-shape range, so fit and proportions matter most",
  heart: "balanced or softly rounded frames can work well with a heart-shaped face"
};

function frameSizeLabel(size) {
  if (!size) return null;
  return `${size.lensWidth}-${size.bridgeWidth}-${size.templeLength}`;
}

function parseProductFrameSize(product) {
  const size = product.attributes?.frameSize;
  if (!size) return null;
  if (typeof size === "string") {
    const match = size.match(/\b(\d{2})\s*[-/ ]\s*(\d{2})\s*[-/ ]\s*(\d{3})\b/);
    if (!match) return null;
    return { lensWidth: Number(match[1]), bridgeWidth: Number(match[2]), templeLength: Number(match[3]) };
  }
  if (Number.isFinite(size.lensWidth) && Number.isFinite(size.bridgeWidth) && Number.isFinite(size.templeLength)) {
    return size;
  }
  return null;
}

function compareFrameSize(productSize, currentSize) {
  if (!productSize || !currentSize) return null;
  const bridgeDelta = productSize.bridgeWidth - currentSize.bridgeWidth;
  const templeDelta = productSize.templeLength - currentSize.templeLength;
  const estimatedFrontDelta = (productSize.lensWidth * 2 + productSize.bridgeWidth) - (currentSize.lensWidth * 2 + currentSize.bridgeWidth);
  const penalty = Math.abs(estimatedFrontDelta) * 1.9 + Math.abs(templeDelta) * 0.55 + Math.abs(bridgeDelta) * 0.9;
  const score = clamp(30 - penalty);
  const notes = [];
  if (Math.abs(estimatedFrontDelta) >= 8) {
    notes.push(`estimated front width differs by about ${estimatedFrontDelta > 0 ? "+" : ""}${estimatedFrontDelta}mm from ${frameSizeLabel(currentSize)}`);
  } else {
    notes.push(`estimated front width is close to current ${frameSizeLabel(currentSize)}`);
  }
  if (Math.abs(templeDelta) >= 7) notes.push(`temple length differs by ${templeDelta > 0 ? "+" : ""}${templeDelta}mm`);
  if (Math.abs(bridgeDelta) >= 3) notes.push(`bridge differs by ${bridgeDelta > 0 ? "+" : ""}${bridgeDelta}mm`);
  return { score, notes, bridgeDelta, templeDelta, estimatedFrontDelta };
}

export function scoreGlasses(product, intent) {
  const a = product.attributes ?? {};
  let score = 18;
  const reasons = [];
  const knownFacts = [];
  const inferences = [];
  const missingFacts = [];

  if (Number.isFinite(product.price)) knownFacts.push(`Frame starting price: $${product.price}`);
  else missingFacts.push("Reliable frame price is not available");

  const productSize = parseProductFrameSize(product);
  if (productSize) knownFacts.push(`Frame size: ${frameSizeLabel(productSize)}`);
  else missingFacts.push("Frame size is not available in the current catalog");

  const sizeFit = compareFrameSize(productSize, intent.currentFrameSize);
  if (sizeFit) {
    score += sizeFit.score;
    reasons.push(sizeFit.notes[0]);
    inferences.push(...sizeFit.notes);
  } else if (intent.currentFrameSize) {
    missingFacts.push(`Cannot compare against current ${frameSizeLabel(intent.currentFrameSize)} without product frame measurements`);
  } else if (intent.width && a.widths?.includes(intent.width)) {
    score += 18;
    reasons.push(`${intent.width}-width option`);
    knownFacts.push(`Width category: ${intent.width}`);
  } else if (!intent.width && a.widths?.includes("medium")) {
    score += 8;
    inferences.push("Medium width is a reasonable starting point when no current frame size is supplied");
  }

  if (intent.faceShape && a.faceShapes?.includes(intent.faceShape)) {
    score += 14;
    reasons.push(FACE_SHAPE_GUIDANCE[intent.faceShape] ?? `may suit a ${intent.faceShape} face`);
    inferences.push("Face-shape guidance is a style heuristic, not a rule");
  } else if (!intent.faceShape) {
    score += 5;
    inferences.push("No face shape supplied; ranking prioritizes fit, lens type, budget, and versatile styles");
  }

  if (a.prescriptions?.includes(intent.prescription)) {
    score += 18;
    reasons.push(`supports ${intent.prescription.replaceAll("_", " ")} lenses`);
    knownFacts.push(`Prescription category supported: ${intent.prescription.replaceAll("_", " ")}`);
  } else {
    score -= 25;
    missingFacts.push(`No reliable support data for ${intent.prescription.replaceAll("_", " ")} lenses`);
  }

  if (intent.prescription === "progressive") {
    if (a.progressive === true) {
      score += 8;
      reasons.push("listed as progressive-compatible");
      knownFacts.push("Progressive compatibility: listed in catalog");
    } else {
      score -= 18;
      missingFacts.push("Progressive compatibility is not confirmed");
    }
    if (Number.isFinite(a.lensHeight)) {
      if (a.lensHeight >= 30) {
        score += 6;
        knownFacts.push(`Lens height: ${a.lensHeight}mm`);
      } else {
        score -= 12;
        inferences.push(`Lens height ${a.lensHeight}mm may be limiting for progressive lenses`);
      }
    } else {
      missingFacts.push("Lens height is not available, so progressive fit confidence is limited");
    }
  }

  if (intent.highPrescription) {
    if (productSize?.lensWidth && productSize.lensWidth <= 50) {
      score += 8;
      reasons.push("smaller lens width can help reduce lens thickness for stronger prescriptions");
      inferences.push("High-prescription guidance is general shopping guidance; confirm lens suitability with an optician");
    } else if (productSize?.lensWidth && productSize.lensWidth >= 54) {
      score -= 10;
      inferences.push("Larger lens width can increase lens edge thickness for stronger prescriptions");
    } else {
      missingFacts.push("Lens width is not available, so high-prescription fit confidence is limited");
    }
  }

  for (const style of intent.styles ?? []) {
    if (a.styles?.includes(style)) {
      score += 6;
      reasons.push(`${style} styling`);
      knownFacts.push(`Style tag: ${style}`);
    }
  }

  if (intent.blueLight && a.blueLight) {
    score += 7;
    reasons.push("blue-light lens option");
    knownFacts.push("Blue-light lens option listed");
  }

  if (intent.bridgeFit === "low_bridge" && a.lowBridgeFit) {
    score += 8;
    reasons.push("low-bridge fit option");
  } else if (intent.bridgeFit) {
    missingFacts.push("Nose bridge fit details are not available");
  }

  if (Number.isFinite(product.price) && Number.isFinite(intent.budget)) {
    if (product.price <= intent.budget) {
      score += 12;
      reasons.push(`frame starts within the $${intent.budget} budget`);
    } else {
      score -= Math.min(22, ((product.price - intent.budget) / intent.budget) * 35);
      inferences.push(`Frame starts above the stated $${intent.budget} budget before lenses or upgrades`);
    }
  }

  return {
    score: clamp(score),
    reasons: reasons.slice(0, 6),
    knownFacts: knownFacts.slice(0, 8),
    inferences: inferences.slice(0, 8),
    missingFacts: missingFacts.slice(0, 8),
    fitConfidence: productSize || intent.width ? "medium" : "low"
  };
}
