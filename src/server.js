import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import http from "node:http";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { loadProducts } from "./catalogs.js";
import { buildAffiliateUrl, trackClick } from "./affiliate.js";
import { recommend, appProfiles } from "./apps.js";
import { handleMcpRequest } from "./mcp.js";
import { loadSubmission } from "./submissions.js";

const port = Number(process.env.PORT ?? 8790);
const publishedApp = process.env.PUBLISHED_APP;
const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`;
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

function visibleAppEntries() {
  const entries = Object.entries(appProfiles);
  if (!publishedApp) return entries;
  return entries.filter(([appId]) => appId === publishedApp);
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(body, null, 2));
}

function sendText(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#172033;background:#f7f8fb;line-height:1.55}
    header,main,footer{max-width:960px;margin:0 auto;padding:28px}
    header{padding-top:44px}
    .eyebrow{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2d6cdf}
    h1{font-size:42px;line-height:1.08;margin:8px 0 14px}
    h2{font-size:24px;margin-top:32px}
    .lead{font-size:19px;color:#3f4d63;max-width:760px}
    .panel{background:#fff;border:1px solid #dfe4ee;border-radius:8px;padding:22px;margin:18px 0}
    a{color:#1f5fbf}
    code{background:#eef2f8;border-radius:4px;padding:2px 5px}
    ul{padding-left:22px}
  </style>
</head>
<body>${body}</body>
</html>`;
}

export function privacyPolicyPage() {
  return page("Glasses Finder Privacy Policy", `
<header>
  <p class="eyebrow">Effective September 5, 2026</p>
  <h1>Privacy Policy</h1>
  <p class="lead">This policy explains what Glasses Finder processes, why it is used, who receives it, how long it is kept, and the choices available to users.</p>
</header>
<main>
  <section class="panel">
    <h2>Data we process</h2>
    <ul>
      <li><strong>Shopping criteria:</strong> the query and optional criteria a user submits, including budget, face shape, frame width, style, prescription category, blue-light preference, and requested result limit.</li>
      <li><strong>Recommendation output:</strong> product names, merchants, prices, fit scores, ranking reasons, follow-up questions, and outbound merchant links returned to ChatGPT.</li>
      <li><strong>Affiliate-click data:</strong> when a user voluntarily opens a shopping link, we record time, app identifier, merchant, product SKU, recommendation rank, broad intent tags, destination URL, and a randomly generated click identifier.</li>
      <li><strong>Technical data:</strong> our hosting provider may automatically process standard request metadata such as IP address, timestamp, URL, browser or client information, and server diagnostics for delivery, security, and troubleshooting.</li>
    </ul>
    <p>Glasses Finder does not request names, email addresses, account credentials, payment-card details, government identifiers, precise location, full prescriptions, medical records, or pupillary-distance measurements. It does not use cookies, create user accounts, or maintain profiles across conversations.</p>
  </section>
  <section class="panel">
    <h2>How and why we use data</h2>
    <ul>
      <li>Shopping criteria are processed to filter and rank eyewear and explain the recommendations requested by the user.</li>
      <li>Recommendation output is returned to ChatGPT so it can present the results in the conversation.</li>
      <li>Affiliate-click data is used to route the user to the selected merchant, measure referral performance, detect abuse, and allow an approved affiliate network or merchant to attribute a purchase.</li>
      <li>Technical data is used to operate, secure, diagnose, and improve the reliability of the service.</li>
    </ul>
    <p>We do not sell personal information, use it for targeted advertising, or use shopping criteria to build advertising profiles.</p>
  </section>
  <section class="panel">
    <h2>Recipients and third parties</h2>
    <ul>
      <li><strong>OpenAI/ChatGPT:</strong> supplies tool inputs and receives the recommendation output. OpenAI processes that information under its own terms and privacy policy.</li>
      <li><strong>Render:</strong> hosts the Glasses Finder server and may process technical request data as our infrastructure provider.</li>
      <li><strong>Selected eyewear merchants and approved affiliate networks:</strong> receive click and referral parameters only after a user chooses an outbound shopping link. Their sites then operate under their own privacy policies.</li>
    </ul>
    <p>We do not disclose shopping criteria or click data to other third parties except when required by law, to protect the service and users, or in connection with a business transfer subject to appropriate safeguards.</p>
  </section>
  <section class="panel">
    <h2>Retention and security</h2>
    <p>Shopping criteria and recommendation outputs are processed for the request and are not stored by the Glasses Finder application. Affiliate-click records are automatically deleted after 30 days. Hosting security and diagnostic logs may be retained by Render for up to 30 days or for the shorter period provided by the applicable hosting plan. We may retain a record longer only when reasonably necessary to investigate abuse, comply with law, or resolve a dispute.</p>
    <p>We use reasonable technical and organizational safeguards, but no internet service can guarantee absolute security.</p>
  </section>
  <section class="panel">
    <h2>User choices and controls</h2>
    <ul>
      <li>Users may omit optional shopping criteria, stop using the app, or choose not to open outbound links.</li>
      <li>Users may request access, correction, or deletion of data associated with a click identifier, or ask a privacy question, by emailing <a href="mailto:sholtsman29@gmail.com">sholtsman29@gmail.com</a>.</li>
      <li>We may need the click identifier and approximate click time to locate a record because we do not collect a user's name or account identifier.</li>
      <li>Requests are handled within 30 days, subject to identity verification and applicable legal exceptions.</li>
    </ul>
  </section>
  <section class="panel">
    <h2>Children, international processing, and changes</h2>
    <p>The service is not directed to children under 13. Data may be processed in the United States or other locations used by OpenAI, Render, merchants, and affiliate networks. We will update this page when our practices materially change and revise the effective date above.</p>
  </section>
</main>
<footer><p>Privacy contact: <a href="mailto:sholtsman29@gmail.com">sholtsman29@gmail.com</a></p></footer>`);
}

function homePage() {
  const name = "Glasses Finder";
  const lead = "A ChatGPT shopping app that helps people compare eyeglass frames by face shape, prescription type, frame width, style, lens options, and budget.";
  const endpoint = `${publicBaseUrl}/mcp`;
  return page(name, `
<header>
  <p class="eyebrow">ChatGPT commerce app</p>
  <h1>${name}</h1>
  <p class="lead">${lead}</p>
</header>
<main>
  <section class="panel">
    <h2>What the app does</h2>
    <p>${name} ranks products by shopper fit first, explains tradeoffs in plain language, and includes a clear affiliate disclosure before outbound shopping links.</p>
  </section>
  <section class="panel">
    <h2>Reviewer information</h2>
    <ul>
      <li>MCP endpoint: <code>${endpoint}</code></li>
      <li>Privacy policy and terms are included on this page and also available at <a href="/privacy">/privacy</a> and <a href="/terms">/terms</a>.</li>
      <li>Support contact: <a href="mailto:sholtsman29@gmail.com">sholtsman29@gmail.com</a></li>
    </ul>
  </section>
  <section class="panel" id="privacy">
    <h2>Privacy Policy</h2>
    <p>Glasses Finder processes user-supplied shopping criteria to return recommendations. When a user chooses an outbound link, limited click data is retained for up to 30 days for routing, attribution, and abuse prevention.</p>
    <p><a href="/privacy">Read the complete Privacy Policy</a> for all data categories, purposes, recipients, retention periods, and user controls.</p>
  </section>
  <section class="panel" id="terms">
    <h2>Terms of Use</h2>
    <p>Glasses Finder provides eyewear shopping guidance inside ChatGPT. It does not sell products, process payments, or guarantee pricing, availability, prescription compatibility, lens cost, delivery, returns, or merchant claims.</p>
    <p>Outbound shopping links may be affiliate links. Product information can change, so users should verify final price, prescription, pupillary distance, measurements, lens options, returns, and merchant policies before purchasing.</p>
    <p>Recommendations are shopping guidance only and are not eye-care diagnosis or treatment advice.</p>
  </section>
  <section class="panel" id="partners">
    <h2>Partner Information</h2>
    <p>Promotion methods include ChatGPT app recommendations, supporting SEO pages, comparison content, and contextual affiliate links shown after a user requests product options. The app avoids medical treatment claims, trademark bidding, false coupons, and unauthorized brand claims.</p>
  </section>
</main>
<footer>
  <p>Independent affiliate publisher. Not affiliated with or endorsed by OpenAI.</p>
</footer>`);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, { ok: true, name: "commerce-finder", appCount: visibleAppEntries().length, publishedApp: publishedApp ?? "portfolio" });
        return;
      }

      if (req.method === "GET" && url.pathname === "/") {
        sendText(res, 200, homePage(), "text/html; charset=utf-8");
        return;
      }

      if (req.method === "GET" && url.pathname === "/privacy") {
        sendText(res, 200, privacyPolicyPage(), "text/html; charset=utf-8");
        return;
      }

      if (req.method === "GET" && url.pathname === "/terms") {
        sendText(res, 200, `Terms of Use

Glasses Finder provides eyewear shopping guidance and comparison support inside ChatGPT. The app does not sell products, process payments, or guarantee pricing, availability, prescription compatibility, lens cost, delivery, returns, or merchant claims.

Outbound links may be affiliate links. Product information can change, so users should verify final price, prescription, pupillary distance, measurements, lens options, returns, and merchant policies before purchasing.

Frame recommendations are not eye-care diagnosis or treatment advice.

Support contact: sholtsman29@gmail.com
`);
        return;
      }

      if (req.method === "GET" && url.pathname === "/support") {
        sendText(res, 200, page("Support", `
<header><h1>Support</h1><p class="lead">For support, privacy, legal, or partnership questions, contact <a href="mailto:sholtsman29@gmail.com">sholtsman29@gmail.com</a>.</p></header>
<main><p><a href="/">Home</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p></main>`), "text/html; charset=utf-8");
        return;
      }

      if (req.method === "GET" && url.pathname === "/demo") {
        const demoResult = recommend("glasses-finder", {
          query: "Find progressive glasses under $200 that suit a round face."
        });
        const demoCards = demoResult.recommendations.map((item, index) => `
  <section class="panel"><h2>${index + 1}. ${item.name}</h2><p><strong>$${item.price}+ frame</strong> · Fit score ${item.score}/100</p><p>${item.reasons.join(" · ")}</p></section>`).join("");
        sendText(res, 200, page("Glasses Finder Demo", `
<header><h1>Glasses Finder Demo</h1><p class="lead">Demo flow for OpenAI plugin review.</p></header>
<main>
  <section class="panel"><h2>User prompt</h2><p>Find progressive glasses under $200 that suit a round face.</p></section>
  <section class="panel"><h2>MCP tool</h2><p><code>recommend_glasses</code></p></section>
  ${demoCards}
  <p>${demoResult.presentation.disclosure}</p>
</main>`), "text/html; charset=utf-8");
        return;
      }

      if (req.method === "GET" && url.pathname === "/demo.gif") {
        const demo = readFileSync(join(rootDir, "submission", "demo.gif"));
        res.writeHead(200, {
          "Content-Type": "image/gif",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600"
        });
        res.end(demo);
        return;
      }

      if (req.method === "GET" && url.pathname === "/demo.mp4") {
        const demo = readFileSync(join(rootDir, "submission", "demo.mp4"));
        res.writeHead(200, {
          "Content-Type": "video/mp4",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600"
        });
        res.end(demo);
        return;
      }

      if (req.method === "GET" && url.pathname === "/partners") {
        sendText(res, 200, page("Partner Information", `
<header><h1>Partner Information</h1><p class="lead">This app is an independent affiliate publisher focused on high-intent ChatGPT shopping conversations.</p></header>
<main>
  <section class="panel"><h2>Promotion methods</h2><p>ChatGPT app recommendations, supporting SEO pages, comparison content, and contextual affiliate links shown after a user requests product options.</p></section>
  <section class="panel"><h2>Compliance posture</h2><p>Affiliate disclosure is shown with outbound links. The app avoids eye-care diagnosis, medical treatment claims, trademark bidding, false coupons, and unauthorized brand claims.</p></section>
</main>`), "text/html; charset=utf-8");
        return;
      }

      if (req.method === "GET" && url.pathname === "/.well-known/openai-apps-challenge") {
        sendText(res, 200, process.env.OPENAI_APPS_CHALLENGE_TOKEN ?? "");
        return;
      }

      if (req.method === "GET" && url.pathname === "/apps") {
        sendJson(res, 200, { apps: visibleAppEntries().map(([, { parser, scorer, ...profile }]) => profile) });
        return;
      }

      if (req.method === "GET" && url.pathname === "/mcp") {
        sendJson(res, 200, {
          ok: true,
          transport: "streamable-http",
          endpoint: `${publicBaseUrl}/mcp`,
          usage: "POST JSON-RPC initialize, tools/list, or tools/call requests to this endpoint."
        });
        return;
      }

      const recommendMatch = url.pathname.match(/^\/apps\/([^/]+)\/recommend$/);
      if (req.method === "POST" && recommendMatch) {
        const appId = decodeURIComponent(recommendMatch[1]);
        if (publishedApp && appId !== publishedApp) {
          sendJson(res, 404, { error: "App is not available in this published deployment" });
          return;
        }
        const payload = await readJson(req);
        sendJson(res, 200, recommend(appId, payload));
        return;
      }

      const submissionMatch = url.pathname.match(/^\/apps\/([^/]+)\/submission$/);
      if (req.method === "GET" && submissionMatch) {
        const submission = loadSubmission(decodeURIComponent(submissionMatch[1]));
        if (!submission) {
          sendJson(res, 404, { error: "Unknown app submission" });
          return;
        }
        sendJson(res, 200, submission);
        return;
      }

      if (req.method === "POST" && url.pathname === "/mcp") {
        const message = await readJson(req);
        const response = handleMcpRequest(message);
        if (response === null || (Array.isArray(response) && response.length === 0)) {
          res.writeHead(202, { "Access-Control-Allow-Origin": "*" });
          res.end();
          return;
        }
        sendJson(res, 200, response);
        return;
      }

      const redirectMatch = url.pathname.match(/^\/r\/([^/]+)\/([^/]+)$/);
      if (req.method === "GET" && redirectMatch) {
        const merchant = decodeURIComponent(redirectMatch[1]);
        const sku = decodeURIComponent(redirectMatch[2]);
        const appId = url.searchParams.get("app") ?? "unknown";
        const product = loadProducts().find((item) => item.merchant === merchant && item.sku === sku);

        if (!product) {
          sendJson(res, 404, { error: "Unknown affiliate target" });
          return;
        }

        const queryId = url.searchParams.get("qid");
        const destination = buildAffiliateUrl(product, appId, queryId ?? undefined);
        const rank = url.searchParams.get("rank");
        trackClick({
          appId,
          merchant,
          sku,
          destination,
          queryId,
          rank: rank ? Number(rank) : null,
          intentTags: url.searchParams.get("tags")?.split(",").filter(Boolean) ?? []
        });
        res.writeHead(302, { Location: destination });
        res.end();
        return;
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer().listen(port, () => {
    console.log(`Commerce Finder listening on http://localhost:${port}`);
  });
}
