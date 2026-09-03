import { loadSubmission } from "./submissions.js";

export function buildPresentation(appId, result) {
  const submission = loadSubmission(appId);
  const top = result.recommendations[0];
  const summary = top ? `${top.name} is the best current frame fit under about $${result.intent.budget}, before lens upgrades.` : "I could not find a strong fit from the current catalog.";
  return { appId, title:submission?.proposedName ?? result.displayName, summary,
    cards:result.recommendations.map((p,i)=>({rank:i+1,title:p.name,merchant:p.merchant,price:`$${p.price} frame starting price`,fitScore:p.score,bullets:p.reasons,callToAction:{label:"View frame",href:p.redirectPath},disclosure:p.affiliateDisclosure})),
    comparisonTable:result.recommendations.map((p,i)=>({rank:i+1,product:p.name,merchant:p.merchant,price:`$${p.price}+ frame`,fitScore:p.score,bestFor:p.reasons.slice(0,2).join(", ")})),
    followUpQuestions:result.nextQuestions, disclosure:submission?.affiliateDisclosure, safety:submission?.safetyPolicy };
}
