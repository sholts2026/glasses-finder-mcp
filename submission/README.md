# Submission Package - Glasses Finder

This package prepares Glasses Finder for the OpenAI App Directory using the MCP-based app flow.

## Checklist

- [x] Focused app name and purpose: Glasses Finder.
- [x] One read-only tool: `recommend_glasses`.
- [x] No checkout, payment, account creation, or lead submission inside the app.
- [x] Affiliate disclosure included in recommendation output and public pages.
- [x] Privacy policy and terms drafted.
- [x] Local MCP and recommendation tests pass.
- [ ] Deploy the MCP backend to stable HTTPS.
- [ ] Replace staging merchant links with approved affiliate tracking.
- [ ] Record a current app demo video showing frame-size understanding and missing-data transparency.
- [ ] Add any OpenAI domain challenge token.
- [ ] Submit in the OpenAI developer dashboard.

## Reviewer Test Prompts

1. `I wear 53-18-145. Find progressive glasses under $200.`
2. `Find lightweight blue-light glasses for a narrow face under $120.`
3. `Compare these sizes: 53-18-145 vs 47-21-140.`
4. `Find reading glasses with a wide fit under $100.`

Expected behavior:

- The app returns ranked products with fit scores and concise tradeoffs.
- Explicit budget, prescription, face-shape, width, and style preferences affect ranking.
- Current-frame measurements such as `53-18-145` are parsed as lens width, bridge width, and temple length.
- The app separates known facts, fit inferences, and missing data instead of inventing unavailable product measurements.
- The app discloses when links may earn a commission.
- Staging links remain non-affiliate until the relevant merchant approves the publisher.
- The app does not make medical claims or replace an eye examination or prescription.
