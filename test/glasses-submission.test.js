import test from "node:test";
import assert from "node:assert/strict";
import { recommend } from "../src/apps.js";
import { handleMcpRequest } from "../src/mcp.js";
import { loadSubmission } from "../src/submissions.js";

test("glasses submission metadata is discovery-focused",()=>{const s=loadSubmission("glasses-finder");assert.equal(s.proposedName,"Glasses Finder");assert.equal(s.targetKeyword,"glasses finder");assert.ok(s.keywords.includes("progressive glasses"));});
test("round-face progressive query receives ranked recommendations",()=>{const r=recommend("glasses-finder",{query:"progressive glasses under $200 for a round face"});assert.ok(r.recommendations.length>=3);assert.match(r.recommendations[0].reasons.join(" "),/round face/);assert.match(r.recommendations[0].reasons.join(" "),/progressive/);});
test("MCP exposes only the glasses tool",()=>{const r=handleMcpRequest({jsonrpc:"2.0",id:1,method:"tools/list",params:{}});assert.deepEqual(r.result.tools.map((t)=>t.name),["recommend_glasses"]);});
test("MCP tool returns structured content",()=>{const r=handleMcpRequest({jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"recommend_glasses",arguments:{query:"lightweight glasses for a square face under $180"}}});assert.equal(r.result.structuredContent.appId,"glasses-finder");assert.ok(r.result.structuredContent.presentation.cards.length);});
