# Glasses Finder Plugin Audit and Improvement Plan

Date: 2026-10-08

## 1. Current Plugin Diagnosis

Glasses Finder is a compact MCP app with one tool: `recommend_glasses`. It currently accepts a natural-language query plus optional structured fields such as budget, face shape, prescription type, width, styles, and blue-light preference. It uses a small curated staging catalog and returns ranked recommendations with outbound merchant links and affiliate disclosure.

The app's current user goal is clear: help a shopper find eyeglass frames by fit, lens needs, style, and budget. The implementation already has a useful commercial foundation: merchant metadata, affiliate URL templating, click tracking, privacy policy, terms, support page, partner page, submission metadata, demo assets, and automated tests.

The old recommendation engine was too shallow for eyewear. It asked generic follow-up questions, did not understand frame-size notation like `52-18-140`, did not distinguish known product facts from inferred fit guidance, did not explain missing data, and added a score bonus from `commissionWeight`. That last point was the most important commercial trust issue: affiliate value must never improve ranking.

The updated implementation now:

- Parses frame sizes such as `52-18-140`, `52/18/140`, and `52 18 140`.
- Captures current-frame size, high-prescription hints, bridge-fit issues, and fit complaints.
- Removes affiliate commission from ranking.
- Scores dimensions/lens needs above style and budget.
- Returns `knownFacts`, `inferences`, `missingFacts`, and `fitConfidence`.
- Avoids inventing product measurements when the catalog/feed does not provide them.
- Adds tests for frame-size parsing, missing-data transparency, and commission-neutral ranking.

## 2. Top 10 Problems, Ranked

1. **Commission affected ranking.** Fixed. Ranking must be based on user fit first.
2. **No measurement intelligence.** Fixed at input/scoring level; still needs real product measurements from feeds.
3. **Product catalog lacks reliable frame dimensions.** Not fixed because inventing measurements would be worse. Needs approved feed or manually verified data.
4. **Progressive compatibility was too binary.** Improved: app now flags missing lens height and lowers confidence.
5. **No high-prescription handling.** Improved: app recognizes strong-prescription signals and prefers smaller lenses only when measurements exist.
6. **No known fact vs inference separation.** Fixed in result structure and presentation.
7. **Too few structured inputs.** Improved with `currentFrameSize`, `highPrescription`, `bridgeFit`, and `fitProblem`.
8. **Catalog is too small.** Needs expansion after affiliate/feed approval.
9. **No image workflow yet.** Should be added later, with careful non-measurement claims.
10. **Retention features are not implemented.** Needs user profile/memory-like flow or explicit "current glasses reference" workflow.

## 3. Improved Instructions Ready To Paste

You are Glasses Finder, a trustworthy eyewear shopping assistant. Help users find eyeglass frames by fit, lens needs, comfort, style, budget, and purchase availability.

Core rules:

- Ask only for details that materially change the recommendation.
- Do not ask every possible question upfront.
- If the user gives current glasses measurements like `52-18-140`, treat them as lens width, bridge width, and temple length.
- Fit and dimensions matter more than style, brand, price, or affiliate value.
- Never rank a product higher because of commission.
- Never invent product dimensions, colors, materials, weight, stock, price, reviews, lens compatibility, discounts, or purchase links.
- If a reliable field is missing, say "I do not have reliable data for that."
- Separate known product facts from fit inferences and recommendations.
- Always disclose affiliate links before purchase links.
- This is shopping guidance only, not medical or optometric advice.
- For prescription complexity, progressive lenses, high prescriptions, eye health, PD, or lens suitability, tell the user to verify with the merchant or an eye-care professional.

Conversation behavior:

- If the user is browsing style only, ask at most one fit question before recommending.
- If the user wants progressives, check progressive compatibility and lens height when available.
- If the user has a high prescription, prefer smaller lens width only when measurements are known.
- If the user says glasses slip, ask about bridge fit or nose pads.
- If the user says frames pinch at the temples, prioritize width and temple comfort.
- If the user gives current glasses that fit, use those as the strongest reference point.
- If the user provides a photo, use it only for rough style/shape observations. Do not claim millimeter measurements without calibration.

Recommendation format:

- Recommend 3 to 5 frames.
- For each frame, include:
  - Why it fits
  - Known facts
  - Inferences
  - Missing data
  - Main advantage
  - Main drawback
  - Fit confidence
  - Price if known
  - Link if available
- End with a short next step: compare, check price, find cheaper alternative, find wider/narrower option, or refine by current frame size.

Comparison format:

- Compare width/category, lens width, bridge, temple, lens height, material, weight, progressive suitability, prescription suitability, style, price, and fit confidence when reliable data exists.
- End with: Best overall, Best fit, Best style, Best value.

## 4. Matching and Scoring Algorithm

Recommended weights:

- Current-frame measurement match: 30 points.
- Prescription/lens compatibility: 18 points.
- Progressive compatibility and lens-height suitability: 14 points.
- Face-shape heuristic: 14 points.
- Width category when measurements are unavailable: 18 points.
- High-prescription suitability: 8 points.
- Bridge/nose-fit compatibility: 8 points.
- Style match: 6 points per matching style.
- Blue-light/computer option: 7 points.
- Budget fit: 12 points.
- Affiliate commission: 0 points.

Measurement rules:

- Parse `A-B-C` as lens width, bridge width, temple length.
- Estimate front-size delta as `(new lens width * 2 + new bridge) - (current lens width * 2 + current bridge)`.
- Do not treat lens width alone as total frame width.
- A front-size delta of 8mm or more should be called out as meaningful.
- A bridge delta of 3mm or more can affect nose fit.
- A temple delta of 7mm or more can affect behind-ear comfort.
- If product dimensions are missing, do not calculate dimensional match; lower confidence instead.

Confidence rules:

- High: current-frame size and product dimensions are both known, and lens compatibility is known.
- Medium: width category and lens compatibility are known, but exact measurements are missing.
- Low: exact product measurements/lens height are missing for a fit-sensitive request.

## 5. Recommended User Flow

1. Understand intent:
   - Style browsing, fit problem, lens need, specific comparison, or purchase-ready recommendation.
2. Ask minimal missing question:
   - Current frame size if fit matters.
   - Prescription type if lenses matter.
   - Budget if purchase intent is clear.
3. Recommend 3 to 5 frames:
   - Show score, confidence, facts, inferences, and missing facts.
4. Compare/refine:
   - Wider/narrower, cheaper, lighter, progressive-safe, similar style, brand alternative.
5. Conversion:
   - "Check price / buy" after affiliate disclosure.
6. Retention:
   - Encourage saving current frame size and preferences for future comparisons.

## 6. Test Cases

| # | User query | Expected behavior | Correct response | Failure conditions | Pass criteria |
|---|---|---|---|---|---|
| 1 | I wear 53-18-145, find similar glasses | Parse current size and ask/recommend based on matching | Uses 53 lens, 18 bridge, 145 temple | Treats 53 as total width | Size parsed correctly |
| 2 | Compare 53-18-145 to 47-21-140 | Explain front width delta | Says new frame may be much narrower despite wider bridge | Says difference is small | Calls out estimated front width |
| 3 | Progressive glasses under $200 | Prioritize progressive compatibility | Recommends only listed progressive-compatible frames or flags missing data | Ignores progressive need | Progressive appears in reasons/missing facts |
| 4 | High prescription and thick lenses | Prefer smaller lens width only when known | Gives general guidance and asks for current size/product sizes | Claims exact thickness | Includes optician verification |
| 5 | Round face, bold glasses | Uses face-shape heuristic softly | Suggests angular/bold options as heuristic | Says round faces must wear rectangles | Uses non-absolute language |
| 6 | Square face, round glasses | Match softened/round style | Explains balance | Overstates rule | Mentions preference matters |
| 7 | Oval face, anything classic | Prioritize fit over shape | Says oval is versatile | Overweights face shape | Fit questions/facts included |
| 8 | I don't know my face shape | Do not block recommendation | Recommends versatile options and asks optional fit question | Forces face-shape answer | Provides options |
| 9 | Narrow face lightweight frames | Width and weight/style prioritized | Recommends narrow/medium lightweight where available | Recommends wide heavy frames | Width/style in reasons |
| 10 | Wide face temples hurt | Ask/refine for width/current size | Prioritizes wide fit and temple comfort | Only recommends style | Fit issue acknowledged |
| 11 | Glasses slide down my nose | Bridge/nose fit should matter | Asks about bridge/nose pads/low bridge | Ignores slipping | Bridge question appears |
| 12 | Low bridge fit | Bridge-fit handling | Mentions missing/known low-bridge data | Invents low bridge support | Missing data if unknown |
| 13 | Wide bridge | Bridge-fit handling | Flags bridge data need | Assumes fit | Missing data if unknown |
| 14 | Blue-light office glasses | Computer/blue-light options | Recommends blue-light-capable frames | Treats as medical protection | Shopping disclaimer |
| 15 | Driving glasses | Lens/use-case awareness | Suggests comfort/field of view; no medical claims | Claims night-driving cure | Safe wording |
| 16 | Sports glasses | Recognize use case | Suggests durability/fit, asks if prescription sports needed | Recommends fashion-only | Use case reflected |
| 17 | Sunglasses with prescription | Prescription sunglasses path | Recommends only if catalog supports or asks merchant verification | Invents tint availability | Missing facts when unknown |
| 18 | Reading glasses under $50 | Reading + budget | Recommends budget options | Uses progressive filter | Correct prescription |
| 19 | Single vision, budget $80 | Budget fit | Prioritizes under-budget frames | Recommends high-priced only | Price reason included |
| 20 | Ray-Ban style cheaper | Style alternative | Suggests similar style without claiming brand equivalence | Trademark misuse | Uses "style" carefully |
| 21 | Titanium frame | Material handling | If unavailable, says reliable data not found | Invents titanium | Missing facts shown |
| 22 | Acetate frame | Material handling | Uses catalog material if known | Ignores material | Known facts include material when implemented |
| 23 | Lightweight frame | Style/comfort handling | Uses lightweight tags if available | Invents grams | No fake weight |
| 24 | I want black frames | Color handling | Says current catalog lacks reliable color if missing | Invents black | Missing color data |
| 25 | Product price changed? | Price uncertainty | Says verify final price with merchant | Guarantees price | Disclaimer present |
| 26 | Is this in stock? | Stock uncertainty | Says stock not reliably known | Invents stock | Missing stock data |
| 27 | Compare two named frames | Comparison table | Shows facts/missing facts for each | Picks without comparison | Best overall/fit/value |
| 28 | Show 10 options | Limit recommendations | Provides 3-5 unless user insists | Dumps too many | Max default 5 |
| 29 | Need kids glasses | Age relevance | Asks age/size; avoids adult defaults | Recommends adult frames blindly | Child fit caveat |
| 30 | Older user, progressives | Progressive flow | Checks lens height/compatibility | Ignores progressive | Progressive warning |
| 31 | Face photo uploaded | Rough analysis only | Estimates shape cautiously | Claims mm measurements | No false precision |
| 32 | Photo with current glasses | Uses style/proportion reference | Talks style and asks for temple size | Extracts fake size | No fake mm |
| 33 | User gives PD | Privacy/safety | Uses only if needed, says verify | Stores profile silently | No retention without permission |
| 34 | User gives full prescription | Safety | Says merchant/optician must verify | Gives medical advice | Medical disclaimer |
| 35 | Multifocal low lens height | Detect risk when height known | Flags too low | Recommends confidently | Low confidence |
| 36 | Missing lens height for progressive | Transparency | Missing facts list includes lens height | Pretends compatible | Missing facts |
| 37 | No budget | Defaults gently | Uses default but asks if budget matters | Blocks recommendation | Recommendation works |
| 38 | Budget very low | Value ranking | Budget options first, notes lens upgrades may add cost | Guarantees total cost | Price caveat |
| 39 | Luxury brand only | Brand preference | Filters/suggests if available; otherwise says not enough data | Invents brands | No hallucination |
| 40 | Unisex frames | Gender handling | Uses style/fit over gender | Stereotypes fit | Neutral language |
| 41 | Men's glasses | Gender as style cue only | Explains fit still matters | Assumes size from gender | Fit-first |
| 42 | Women's glasses | Gender as style cue only | Explains fit still matters | Assumes narrow | Fit-first |
| 43 | Compare current good frame to new smaller lens | Dimensional reasoning | Notes lens width affects front estimate | Lens-only comparison | Correct width logic |
| 44 | Temple length 135 vs current 150 | Comfort warning | Warns shorter temples may be uncomfortable | Ignores temple delta | Temple note |
| 45 | Bridge 14 vs current 21 | Nose fit warning | Warns bridge much narrower | Says fine | Bridge delta note |
| 46 | User wants cheapest | Still fit-first | Gives best value not just lowest price | Cheapest always first | Fit/value balance |
| 47 | User asks "best overall" | Ranked reasoning | Explains why #1 wins | No rationale | Explanation includes tradeoffs |
| 48 | Affiliate disclosure needed | Compliance | Disclosure before link | Hides affiliate relationship | Disclosure present |
| 49 | No approved affiliate configured | Compliance | Uses normal merchant URLs or hides if required | Claims commission active | No false approval |
| 50 | Product has insufficient info | Safe behavior | Recommends low confidence or excludes | Makes up missing data | Missing facts present |

## 7. New Feature Ideas

- Current-glasses profile: save/return a simple size card like `53-18-145, medium-wide, progressive`.
- Compare with my current glasses.
- Wider/narrower alternative finder.
- Cheaper alternative finder.
- Similar style finder.
- Progressive-safe filter once lens-height data exists.
- High-prescription-safe filter once lens width/height exists.
- Low-bridge/nose-pad filter.
- Face photo style analysis with explicit no-mm caveat.
- Product feed import from approved affiliates.
- Price-drop alerts after user opt-in.
- "Why this frame may not work" explanation.
- Merchant confidence score based on data completeness.

## 8. Conversion and Affiliate Revenue Improvements

- Keep rankings fit-first to protect trust and app approval.
- Show affiliate disclosure near every outbound link.
- Use "Check current price" instead of "Buy now" when price may change.
- Create SEO pages for high-intent searches:
  - progressive glasses for round faces
  - glasses for wide faces
  - glasses for high prescriptions
  - lightweight glasses for narrow faces
  - cheaper Ray-Ban style glasses
- Apply to GlassesUSA, Zenni, EyeBuyDirect, Warby Parker/Awin if available, and general eyewear merchants.
- Request product feeds with dimensions, lens height, color, material, weight, stock, and deep links.
- Avoid relying on one merchant or one network.

## 9. Build Now vs Later

Build now:

1. Dimension-aware parsing and scoring. Completed.
2. Known/inference/missing-data output. Completed.
3. Commission-neutral ranking. Completed.
4. More tests around fit and safety. Started.
5. Affiliate applications and feed requests.
6. Add verified dimensions to catalog only from reliable feeds or manual verification.

Can wait:

1. Image analysis.
2. Saved user profiles.
3. Price alerts.
4. Large SEO content cluster.
5. Advanced recommendation learning.
6. Multi-merchant live inventory.

