# Glasses Finder

Glasses Finder is an MCP-based ChatGPT shopping app for comparing physical eyeglass frames by face shape, prescription type, fit, style, lens options, and budget.

## Run

```powershell
npm test
$env:PUBLISHED_APP="glasses-finder"
$env:REQUIRE_AFFILIATE_PRODUCTS="false"
npm start
```

Production should expose only `recommend_glasses`. Set `REQUIRE_AFFILIATE_PRODUCTS=true` only after at least one approved merchant tracking template is configured in `AFFILIATE_CONFIG_JSON`.

Endpoints: `/health`, `/mcp`, `/demo`, `/privacy`, `/terms`, `/support`, and `/partners`.
