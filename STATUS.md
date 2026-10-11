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
- GlassesUSA re-application was submitted in Impact on 2026-10-08 and immediately declined with no detailed reason shown in the marketplace UI.
- Zenni Optical and Zenni Optical - Zenbassador were inspected in Impact on 2026-10-09. Impact currently shows "Not yet approved to apply", so no Zenni application could be submitted yet.
- EyeBuyDirect's CJ account was activated and the EyeBuyDirect application was submitted on 2026-10-11. CJ now shows EyeBuyDirect under Pending Applications for publisher `8077813`. Evidence screenshot: `cj-eyebuydirect-pending.png`. A direct request was also sent to `CJ_LuxOptical@cj.com` asking for publisher review, the correct application route, and product feed/deep-link documentation.
- Warby Parker (US) was verified in Awin's public listing on 2026-10-09. Application requires an Awin publisher account before a program join request can be submitted.
- Fit-first scoring upgrade: parses `52-18-140` style frame sizes, separates known facts from inferences and missing data, and removes affiliate commission from ranking.
- Product audit and QA plan: `docs/GLASSES_PLUGIN_AUDIT_AND_TESTS.md` includes improved instructions, scoring algorithm, recommended flow, 50 test cases, feature ideas, and conversion/affiliate improvements.

## Next

1. Monitor EyeBuyDirect's pending CJ application, create/complete an Awin publisher account for Warby Parker, and resolve Impact eligibility for Zenni. Keep GlassesUSA as declined unless a manual appeal route opens.
2. Enter approved tracking templates and request product feeds with reliable frame dimensions, lens height, material, color, weight, stock, and deep links.
3. Expand the catalog only with verified product data; do not manually invent frame measurements.
4. Submit the app to OpenAI review.

## Important

The current staging catalog uses ordinary merchant URLs. No commission is earned until an affiliate program approves the publisher and its tracking configuration is enabled.
