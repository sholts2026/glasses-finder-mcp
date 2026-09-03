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
- [ ] Record a current app demo video and create final icon assets.
- [ ] Add any OpenAI domain challenge token.
- [ ] Submit in the OpenAI developer dashboard.

## Reviewer Test Prompts

1. `Find progressive glasses under $200 that suit a round face.`
2. `Find lightweight blue-light glasses for a narrow face under $120.`
3. `Compare acetate and metal frames for an oval face.`
4. `Find reading glasses with a wide fit under $100.`

Expected behavior:

- The app returns ranked products with fit scores and concise tradeoffs.
- Explicit budget, prescription, face-shape, width, and style preferences affect ranking.
- The app discloses when links may earn a commission.
- Staging links remain non-affiliate until the relevant merchant approves the publisher.
- The app does not make medical claims or replace an eye examination or prescription.
