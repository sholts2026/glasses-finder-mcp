import { recommend } from "./apps.js";

const tool = {
  name:"recommend_glasses",
  title:"Recommend glasses",
  description:"Recommend physical eyeglass frames by face shape, prescription type, frame width, style, blue-light preference, and budget.",
  inputSchema:{type:"object",properties:{query:{type:"string"},budget:{type:"number"},limit:{type:"number"},faceShape:{type:"string",enum:["round","square","oval","heart"]},prescription:{type:"string",enum:["single_vision","progressive","reading"]},width:{type:"string",enum:["narrow","medium","wide"]},styles:{type:"array",items:{type:"string",enum:["lightweight","bold","vintage"]}},blueLight:{type:"boolean"}},required:["query"]},
  outputSchema:{type:"object",properties:{appId:{type:"string"},displayName:{type:"string"},recommendations:{type:"array",items:{type:"object",properties:{sku:{type:"string"},name:{type:"string"},merchant:{type:"string"},price:{type:"number"},score:{type:"number"},reasons:{type:"array",items:{type:"string"}},buyUrl:{type:"string"},affiliateDisclosure:{type:"string"}}}},nextQuestions:{type:"array",items:{type:"string"}}}},
  annotations:{readOnlyHint:true,openWorldHint:false,destructiveHint:false}
};

export function handleMcpRequest(message) {
  if (Array.isArray(message)) return message.filter((item)=>item.id!==undefined).map(handleMcpRequest);
  if (!message?.method) return {jsonrpc:"2.0",id:message?.id??null,error:{code:-32600,message:"Invalid request"}};
  if (message.id===undefined) return null;
  if (message.method==="initialize") return {jsonrpc:"2.0",id:message.id,result:{protocolVersion:message.params?.protocolVersion??"2025-06-18",capabilities:{tools:{}},serverInfo:{name:"glasses-finder",version:"1.0.0"},instructions:"Recommend physical eyeglass frames by shopper fit. Include affiliate disclosure and remind users to verify prescription and measurements."}};
  if (message.method==="tools/list") return {jsonrpc:"2.0",id:message.id,result:{tools:[tool]}};
  if (message.method==="tools/call") {
    const {name,arguments:args={}}=message.params??{};
    if (name!==tool.name) return {jsonrpc:"2.0",id:message.id,error:{code:-32601,message:`Unknown tool: ${name}`}};
    const result=recommend("glasses-finder",args);
    return {jsonrpc:"2.0",id:message.id,result:{structuredContent:result,content:[{type:"text",text:JSON.stringify(result,null,2)}]}};
  }
  return {jsonrpc:"2.0",id:message.id,error:{code:-32601,message:`Unknown method: ${message.method}`}};
}
