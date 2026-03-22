import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const FilterActionSchema = z.object({
  title: z.string().nullable().describe("Job title or role exactly to search for (e.g., 'React Developer')"),
  skills: z.array(z.string()).nullable().describe("Technical skills or tech stack to filter by"),
  datePosted: z.enum(["Any time", "Last 24 hours", "Last week", "Last month"]).nullable().describe("Timeframe filter"),
  scoreMin: z.number().nullable().describe("Minimum AI Match score percentage (e.g., 40, 70)"),
  scoreMax: z.number().nullable().describe("Maximum AI Match score percentage (e.g., 70, 100)"),
  selectedTypes: z.array(z.string()).nullable().describe("Array of job types: 'Full-time', 'Part-time', 'Contract', 'Internship'"),
  selectedLocations: z.array(z.string()).nullable().describe("Array of models: 'Remote', 'Hybrid', 'On-site'"),
  city: z.string().nullable().describe("Specific physical city or region (e.g., 'Bangalore', 'Hyderabad')"),
  clearAll: z.boolean().nullable().describe("Only set to true if the user explicitly asks to drop or reset all filters")
}).describe("Strict UI commands to emit. Only emit keys the user EXPLICITLY requested changing in the current turn. Null out the rest.");

const AgentState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => [],
  },
  currentFilters: {
    value: (x, y) => y ?? x,
    default: () => ({}),
  },
  resumeText: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  intent: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  preprocessedQuery: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  filterActions: {
    value: (x, y) => y ?? x,
    default: () => null,
  },
  finalResponse: {
    value: (x, y) => y ?? x,
    default: () => "",
  }
};

const getModel = () => {
  return new ChatOpenAI({
    modelName: "openai/gpt-4o-mini",
    temperature: 0.1,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
  });
};

async function preprocessingNode(state) {
  const model = getModel();
  const latestMessage = state.messages[state.messages.length - 1];
  
  const prompt = `You are a spelling and synonym normalizer.
Clean the following user query. Fix typos (e.g., 'Banglore' -> 'Bangalore', 'Hyd' -> 'Hyderabad').
Map synonyms intuitively (e.g., 'intern' -> 'internship', 'WFH' -> 'remote', 'work from home' -> 'remote').
Keep the original meaning intact. Only return the corrected string, nothing else.

Raw Query: "${latestMessage.content}"`;

  const res = await model.invoke([new SystemMessage(prompt)]);
  return { preprocessedQuery: res.content };
}

async function intentClassifierNode(state) {
  const model = getModel();
  const schema = z.object({
     intent: z.string().nullable().describe("MUST be exactly one of: 'Search', 'FilterUpdate', 'Help', or 'MultiIntent'")
  });
  
  const structuredModel = model.withStructuredOutput(schema, { name: "classify_intent" });
  const prompt = `Classify this user query into one of: 'Search' (looking for jobs), 'FilterUpdate' (modifying UI filters like 'remote only'), 'Help' (asking product questions), or 'MultiIntent' (combination of searching and filtering).
  
Query: "${state.preprocessedQuery}"`;

  const res = await structuredModel.invoke([new SystemMessage(prompt)]);
  return { intent: res.intent || "Help" };
}

async function toolExecutionNode(state) {
  const model = getModel();
  const structuredModel = model.withStructuredOutput(FilterActionSchema, { name: "execute_filters" });
  
  const prompt = `You are a precision UI tool. Extract filter configurations from the query.
Current Active Filters: ${JSON.stringify(state.currentFilters)}
User Request: "${state.preprocessedQuery}"

Mapping Rules:
- "High match" -> scoreMin: 70, scoreMax: null
- "Medium match" -> scoreMin: 40, scoreMax: 70
- "Low match" -> scoreMin: null, scoreMax: 39

Only return fields absolutely necessitated by the prompt. Use exact mappings.`;

  const res = await structuredModel.invoke([new SystemMessage(prompt)]);
  return { filterActions: res };
}

async function responseGeneratorNode(state) {
  const model = getModel();
  let prompt = `You are a friendly, human-like AI job assistant. Respond naturally to the user.
Context:
- User Intent: ${state.intent}
- Applied Filter Action Payload: ${JSON.stringify(state.filterActions)}
- Extracted Resume (User Profile context): ${state.resumeText ? state.resumeText.substring(0, 500) : "No resume"}
- Original Request: "${state.messages[state.messages.length - 1]?.content}"

Provide a highly concise, cheerful response summarizing the actions taken or answering their help question. Do not dump technical JSON to the user.
If no exact matches are expected due to heavy filtering, add a graceful conversational fallback warning ("I applied those strict filters, but if nothing matches exactly, you'll see some similar generalized roles!").`;

  const res = await model.invoke([new SystemMessage(prompt)]);
  return { finalResponse: res.content };
}

const workflow = new StateGraph({ channels: AgentState })
  .addNode("preprocess", preprocessingNode)
  .addNode("classifyIntent", intentClassifierNode)
  .addNode("toolExec", toolExecutionNode)
  .addNode("responseGen", responseGeneratorNode)
  .addEdge(START, "preprocess")
  .addEdge("preprocess", "classifyIntent")
  .addConditionalEdges("classifyIntent", (state) => {
     if (state.intent === "Help") return "responseGen";
     return "toolExec";
  })
  .addEdge("toolExec", "responseGen")
  .addEdge("responseGen", END);

// Using MemorySaver for conversational thread tracking
const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

export async function processChatIntent(messages, currentFilters, resumeText, threadId = "default-user") {
  if (!process.env.OPENROUTER_API_KEY) {
     return {
        message: "I am simulated! Provide an OPENROUTER_API_KEY to activate my real intelligence.",
        filterActions: {}
     };
  }

  // Format into LangChain native message types
  const formattedMessages = messages.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content));

  const config = { configurable: { thread_id: threadId } };
  
  try {
    const outputState = await app.invoke({
      messages: formattedMessages,
      currentFilters,
      resumeText,
      intent: "",
      preprocessedQuery: "",
      filterActions: null,
      finalResponse: ""
    }, config);

    return {
      message: outputState.finalResponse,
      filterActions: outputState.filterActions || {}
    };
  } catch(e) {
    console.error("LangGraph Orchestration Failed:", e);
    throw e;
  }
}
