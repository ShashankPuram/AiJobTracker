import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const JobMatchSchema = z.object({
  matches: z.array(z.object({
    jobId: z.string().describe("The ID of the job"),
    score: z.number().min(0).max(100).describe("Match score between 0 and 100 based on resume skills"),
    explanation: z.string().describe("Short 1-2 sentence explanation covering matching skills, relevant experience, and keywords alignment")
  }))
});

export async function scoreJobsWithLangChain(resumeText, jobs) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("No OPENROUTER_API_KEY found. Falling back to simulated AI matching.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return jobs.map(j => ({
      jobId: j.id,
      score: Math.floor(Math.random() * 40) + 60, // random 60-100
      explanation: `(Simulated AI) Your extracted skills show potential alignment with the ${j.title} role's requirements.`
    }));
  }

    const model = new ChatOpenAI({
      modelName: "openai/gpt-4o-mini",
      temperature: 0,
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: { baseURL: "https://openrouter.ai/api/v1" }
    });

  const structuredModel = model.withStructuredOutput(JobMatchSchema, { name: "evaluate_jobs" });
  
  const jobsData = jobs.map(j => ({ id: j.id, title: j.title, description: j.type + ' ' + j.location }));
  
  const prompt = `You are an expert technical AI recruiter.
Compare the applicant's resume with the available jobs.
Assign each job a match score (0-100) and a very brief explanation of why.

RESUME TEXT:
${resumeText.substring(0, 3000)}

AVAILABLE JOBS:
${JSON.stringify(jobsData, null, 2)}`;

  try {
    const response = await structuredModel.invoke(prompt);
    return response.matches;
  } catch (error) {
    console.error("AI matching failed", error);
    throw error;
  }
}

export async function extractSearchQueries(resumeText) {
  if (!process.env.OPENROUTER_API_KEY) {
    const txt = resumeText.toLowerCase();
    const skills = [];
    if (txt.includes("python") || txt.includes("django")) { skills.push("Python", "Django"); queries = ["Python Developer", "Backend Developer"]; }
    else if (txt.includes("react") || txt.includes("frontend")) { skills.push("React", "Frontend UI"); queries = ["Frontend Developer", "React Developer", "UI Engineer"]; }
    else if (txt.includes("data") || txt.includes("ml") || txt.includes("machine learning")) { skills.push("Machine Learning", "Data Analysis", "Python"); queries = ["Data Scientist", "ML Engineer", "AI Engineer"]; }
    else { skills.push("JavaScript", "Node.js", "Git"); queries = ["Software Engineer", "Full Stack Developer"]; }
    
    return {
      queries,
      skills: skills
    };
  }
  
  const { ChatOpenAI } = await import("@langchain/openai");
  const { ChatPromptTemplate } = await import("@langchain/core/prompts");
  const { z } = await import("zod");
  
  const llm = new ChatOpenAI({ 
    modelName: "openai/gpt-4o-mini", 
    temperature: 0,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: { baseURL: "https://openrouter.ai/api/v1" }
  });
  const schema = z.object({
    queries: z.array(z.string()).min(2).max(4).describe("Top 2-4 best job title search queries reflecting the user's focus (e.g. ['ML Engineer', 'Data Scientist'])"),
    skills: z.array(z.string()).max(6).describe("Top extracted technical framework skills from resume")
  });
  
  const structuredLlm = llm.withStructuredOutput(schema, { name: "extract_resume_skills" });
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert technical recruiter. Extract the applicant's top technical framework skills and generate the most accurate job title search query string."],
    ["user", "{resume}"]
  ]);
  
  const chain = prompt.pipe(structuredLlm);
  const res = await chain.invoke({ resume: resumeText.substring(0, 3000) });
  return res;
}
