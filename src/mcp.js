import { recommend } from "./apps.js";
import { trackEvent } from "./analytics.js";

const tool = {
  name:"recommend_glasses",
  title:"Recommend glasses",
  description:"Recommend physical eyeglass frames by face shape, current frame measurements, prescription type, frame width, style, blue-light preference, and budget. Do not infer unavailable product measurements.",
  inputSchema:{type:"object",properties:{query:{type:"string"},budget:{type:"number"},limit:{type:"number"},faceShape:{type:"string",enum:["round","square","oval","heart"]},prescription:{type:"string",enum:["single_vision","progressive","reading"]},width:{type:"string",enum:["narrow","medium","wide"]},styles:{type:"array",items:{type:"string",enum:["lightweight","bold","vintage","classic","minimal","modern","budget"]}},blueLight:{type:"boolean"},highPrescription:{type:"boolean"},bridgeFit:{type:"string",enum:["low_bridge","wide_bridge"]},fitProblem:{type:"string",enum:["slipping","temple_pressure"]},currentFrameSize:{type:"string",description:"Current glasses size such as 52-18-140, if the user provides it."}},required:["query"]},
  outputSchema:{type:"object",properties:{appId:{type:"string"},displayName:{type:"string"},recommendations:{type:"array",items:{type:"object",properties:{sku:{type:"string"},name:{type:"string"},merchant:{type:"string"},price:{type:"number"},score:{type:"number"},fitConfidence:{type:"string"},reasons:{type:"array",items:{type:"string"}},knownFacts:{type:"array",items:{type:"string"}},inferences:{type:"array",items:{type:"string"}},missingFacts:{type:"array",items:{type:"string"}},buyUrl:{type:"string"},affiliateDisclosure:{type:"string"}}}},nextQuestions:{type:"array",items:{type:"string"}}}},
  annotations:{readOnlyHint:true,openWorldHint:false,destructiveHint:false}
};

function trackRecommendation(appId, tool, args, result) {
  try {
    trackEvent("mcp_invocation", { appId, tool, hasBudget: args.budget !== undefined });
    trackEvent("recommendations_shown", {
      appId,
      tool,
      count: result.recommendations?.length ?? 0,
      merchants: [...new Set((result.recommendations ?? []).map((item) => item.merchant))]
    });
  } catch {
    // Analytics must never affect a shopper recommendation.
  }
}
export function handleMcpRequest(message) {
  if (Array.isArray(message)) return message.filter((item)=>item.id!==undefined).map(handleMcpRequest);
  if (!message?.method) return {jsonrpc:"2.0",id:message?.id??null,error:{code:-32600,message:"Invalid request"}};
  if (message.id===undefined) return null;
  if (message.method==="initialize") return {jsonrpc:"2.0",id:message.id,result:{protocolVersion:message.params?.protocolVersion??"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"glasses-finder",version:"1.0.0"},instructions:"Recommend physical eyeglass frames by shopper fit. Ask only for missing details that materially change fit. Prioritize dimensions, lens needs, and comfort over style and affiliate value. Separate known facts, inferences, and missing data. Never invent sizes, colors, prices, stock, reviews, or lens compatibility. Include affiliate disclosure and remind users to verify prescription, measurements, lens options, price, and availability with the merchant or an eye-care professional."}};
  if (message.method==="tools/list") return {jsonrpc:"2.0",id:message.id,result:{tools:[tool]}};
  if (message.method==="tools/call") {
    const {name,arguments:args={}}=message.params??{};
    if (name!==tool.name) return {jsonrpc:"2.0",id:message.id,error:{code:-32601,message:`Unknown tool: ${name}`}};
    const result=recommend("glasses-finder",args);
    trackRecommendation("glasses-finder", name, args, result);
    return {jsonrpc:"2.0",id:message.id,result:{structuredContent:result,content:[{type:"text",text:JSON.stringify(result,null,2)}]}};
  }
  return {jsonrpc:"2.0",id:message.id,error:{code:-32601,message:`Unknown method: ${message.method}`}};
}

