import { getProductsByCategory, loadMerchants, loadProducts } from "./catalogs.js";
import { buildAffiliateUrl, buildRedirectPath } from "./affiliate.js";
import { hasAffiliateTemplate } from "./affiliateConfig.js";
import { parseGlassesIntent } from "./intent.js";
import { buildPresentation } from "./presentation.js";
import { scoreGlasses } from "./scoring.js";

export const appProfiles = { "glasses-finder": { appId:"glasses-finder", displayName:"Glasses Finder", targetKeyword:"glasses finder", category:"eyewear", parser:parseGlassesIntent, scorer:scoreGlasses } };

export function recommend(appId, payload = {}) {
  const profile = appProfiles[appId];
  if (!profile) throw new Error(`Unknown appId "${appId}".`);
  const intent = profile.parser(payload.query ?? "", payload);
  const merchants = loadMerchants();
  const tags = [intent.faceShape, intent.prescription, intent.width, ...intent.styles, intent.blueLight ? "blue_light" : null].filter(Boolean);
  const recommendations = getProductsByCategory(profile.category)
    .map((product) => ({ product, scored: profile.scorer(product, intent) }))
    .filter(({ scored }) => scored.score >= 35)
    .filter(({ product }) => process.env.REQUIRE_AFFILIATE_PRODUCTS === "false" || !process.env.PUBLISHED_APP || hasAffiliateTemplate(product))
    .sort((a, b) => b.scored.score - a.scored.score)
    .slice(0, payload.limit ?? 3)
    .map(({ product, scored }, index) => ({ sku:product.sku, name:product.name, merchant:merchants[product.merchant]?.name ?? product.merchant, price:product.price, priceUnit:product.priceUnit, score:scored.score, reasons:scored.reasons, buyUrl:buildAffiliateUrl(product, appId), redirectPath:buildRedirectPath(product, appId,{rank:index+1,intentTags:tags}), affiliateDisclosure:"We may earn a commission if you buy through this link. Rankings are based on user fit first." }));
  const result = { appId, displayName:profile.displayName, intent, recommendations, nextQuestions:[intent.faceShape?null:"What is your face shape?",intent.width?null:"Do you know your current frame width?","Do you need single-vision, reading, or progressive lenses?"].filter(Boolean), productCount:loadProducts().filter((p)=>p.category===profile.category).length };
  if (payload.includePresentation ?? true) result.presentation = buildPresentation(appId, result);
  return result;
}
