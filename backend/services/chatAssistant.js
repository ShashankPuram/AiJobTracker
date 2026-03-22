import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// Define the Tool
const applyFiltersTool = tool(
  async ({ types, locations }) => {
    return JSON.stringify({ success: true, types, locations });
  },
  {
    name: "apply_filters",
    description: "Applies job search filters based on the user's request. Always call this when the user asks to filter by job type (e.g., Full-time, Contract) or location (e.g., Remote, On-site) or clear filters.",
    schema: z.object({
      types: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional()
    })
  }
);

export async function processChat(messagesData) {
  // Simulated Fallback if no OpenAI Key is present
  if (!process.env.OPENAI_API_KEY) {
    const lastMsgContent = messagesData[messagesData.length - 1].content.toLowerCase();
    await new Promise(r => setTimeout(r, 1200)); // Simulate think time
    
    let newFilters = null;
    let reply = "I'm currently running in simulated offline mode without an API key, but I'm doing my best to assist you!";
    
    if (lastMsgContent.includes("remote")) {
      newFilters = { locations: ["Remote"] };
      reply = "Got it! I've updated your filters to show 'Remote' jobs.";
    } else if (lastMsgContent.includes("clear") || lastMsgContent.includes("reset") || lastMsgContent.includes("all")) {
      newFilters = { types: [], locations: [] };
      reply = "I have cleared all your job filters so you can see everything.";
    } else if (lastMsgContent.includes("full") || lastMsgContent.includes("time")) {
      newFilters = { types: ["Full-time"] };
      reply = "I've applied the 'Full-time' filter to your Job Feed.";
    } else if (lastMsgContent.includes("contract")) {
      newFilters = { types: ["Contract"] };
      reply = "I've applied the 'Contract' filter for you.";
    } else if (lastMsgContent.includes("hybrid")) {
      newFilters = { locations: ["Hybrid"] };
      reply = "I've enabled the 'Hybrid' location filter.";
    }

    return { reply, newFilters };
  }

  // Actual LangGraph Workflow Initialization
  try {
    const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
    const llmWithTools = llm.bindTools([applyFiltersTool]);
    
    // Simple state node
    const chatbot = async (state) => {
      const response = await llmWithTools.invoke(state.messages);
      return { messages: [response] };
    };

    const graph = new StateGraph(MessagesAnnotation)
      .addNode("chatbot", chatbot)
      .addEdge("__start__", "chatbot")
      .addEdge("chatbot", "__end__")
      .compile();

    // Map raw chat to LangChain messages
    const formattedMessages = [
       new AIMessage("I am an AI Career Assistant. How can I help you filter your job searches today?"),
       ...messagesData.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content))
    ];
    
    const result = await graph.invoke({ messages: formattedMessages });
    const aiResponseMsg = result.messages[result.messages.length - 1];
    
    let extractedFilters = null;
    
    if (aiResponseMsg.tool_calls && aiResponseMsg.tool_calls.length > 0) {
      const call = aiResponseMsg.tool_calls.find(tc => tc.name === "apply_filters");
      if (call) {
        extractedFilters = call.args;
      }
    }

    return {
      reply: aiResponseMsg.content || "I have automatically updated the filters for you based on our conversation.",
      newFilters: extractedFilters
    };
  } catch (error) {
    console.error("LangGraph processing error:", error);
    throw error;
  }
}
