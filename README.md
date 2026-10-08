# Glasses Finder

Glasses Finder is an MCP-based ChatGPT shopping app for comparing physical eyeglass frames by face shape, prescription type, fit, style, lens options, and budget.

The current recommendation engine is fit-first: it parses current-frame measurements such as `52-18-140`, separates known facts from fit inferences and missing product data, and does not use affiliate commission to improve ranking. See `docs/GLASSES_PLUGIN_AUDIT_AND_TESTS.md` for the product audit, improved instructions, scoring model, and 50 QA test cases.

## Run

```powershell
npm test
$env:PUBLISHED_APP="glasses-finder"
$env:REQUIRE_AFFILIATE_PRODUCTS="false"
npm start
```

Production should expose only `recommend_glasses`. Set `REQUIRE_AFFILIATE_PRODUCTS=true` only after at least one approved merchant tracking template is configured in `AFFILIATE_CONFIG_JSON`.

Endpoints: `/health`, `/mcp`, `/demo`, `/privacy`, `/terms`, `/support`, and `/partners`.
