const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

export function scoreGlasses(product, intent) {
  const a = product.attributes;
  let score = 25;
  const reasons = [];
  if (intent.faceShape && a.faceShapes.includes(intent.faceShape)) { score += 22; reasons.push(`frame geometry suits a ${intent.faceShape} face`); }
  if (!intent.faceShape) { score += 8; reasons.push("versatile face-shape fit"); }
  if (a.prescriptions.includes(intent.prescription)) { score += 18; reasons.push(`supports ${intent.prescription.replaceAll("_", " ")} lenses`); }
  if (intent.width && a.widths.includes(intent.width)) { score += 12; reasons.push(`${intent.width}-width option`); }
  if (!intent.width && a.widths.includes("medium")) { score += 6; reasons.push("available in a common medium width"); }
  for (const style of intent.styles) {
    if (a.styles.includes(style)) { score += 8; reasons.push(`${style} styling`); }
  }
  if (intent.blueLight && a.blueLight) { score += 8; reasons.push("blue-light lens option"); }
  if (product.price <= intent.budget) { score += 14; reasons.push(`frame starts within the $${intent.budget} budget`); }
  else { score -= Math.min(25, ((product.price - intent.budget) / intent.budget) * 40); }
  score += product.commissionWeight * 2;
  return { score: clamp(score), reasons: reasons.slice(0, 5) };
}
