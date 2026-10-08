# Glasses Finder Status

## Complete

- Standalone MCP app with `recommend_glasses`.
- Intent parsing for budget, face shape, fit, style, prescription, and blue-light preference.
- Curated staging catalog across four eyewear merchants.
- Ranking explanations, tradeoffs, affiliate disclosure, privacy policy, and terms.
- Automated tests and local MCP verification.
- Public GitHub repository and Render Blueprint deployment.
- Live HTTPS verification for `/health` and `recommend_glasses` through `/mcp`.
- Final 512px app icon.
- Seven-second 1280x720 H.264 review demo video.
- Current official affiliate-program verification for GlassesUSA, EyeBuyDirect, and Zenni.
- Fit-first scoring upgrade: parses `52-18-140` style frame sizes, separates known facts from inferences and missing data, and removes affiliate commission from ranking.
- Product audit and QA plan: `docs/GLASSES_PLUGIN_AUDIT_AND_TESTS.md` includes improved instructions, scoring algorithm, recommended flow, 50 test cases, feature ideas, and conversion/affiliate improvements.

## Next

1. Apply to GlassesUSA and Zenni in Impact, then EyeBuyDirect in CJ.
2. Enter approved tracking templates and request product feeds with reliable frame dimensions, lens height, material, color, weight, stock, and deep links.
3. Expand the catalog only with verified product data; do not manually invent frame measurements.
4. Submit the app to OpenAI review.

## Important

The current staging catalog uses ordinary merchant URLs. No commission is earned until an affiliate program approves the publisher and its tracking configuration is enabled.
