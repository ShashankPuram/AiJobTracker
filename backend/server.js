import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import pdfParse from 'pdf-parse';
import { usersDB } from './data.js';
import { extractSearchQueries } from './services/aiMatcher.js';
import { processChat } from './services/chatAssistant.js';
import { processChatIntent } from './services/chatAgent.js';
import { activeJobsDB, syncAllJobs, setUserResumeText, userResumeText } from './services/jobManager.js';
import path from 'path';
import Fuse from 'fuse.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: '*' });
await fastify.register(multipart);

fastify.get('/', async () => {
  return { 
    status: "AI Job Matcher API is running 🚀", 
    endpoints: ["/jobs", "/applications", "/resume/upload", "/chat", "/api/chat", "/jobs/sync"] 
  };
});

// GET /jobs - returns dynamically synchronized and merged jobs
fastify.get('/jobs', async (request, reply) => {
  const { type, location, city, title, skills, datePosted, scoreMin, scoreMax } = request.query;
  
  let filtered = [...activeJobsDB];
  let isFallback = false;
  
  // 1. Role / Title
  if (title) {
    const fuse = new Fuse(filtered, { keys: ['title'], threshold: 0.4 });
    const results = fuse.search(title);
    filtered = results.map(r => r.item);
  }
  
  // 2. Skills
  if (skills) {
    const skillsArr = skills.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
    filtered = filtered.filter(j => {
       const hasSkillTags = Array.isArray(j.skills) && j.skills.some(skill => skill && typeof skill === 'string' && skillsArr.includes(skill.toLowerCase()));
       const descriptionHasSkills = j.description && typeof j.description === 'string' && skillsArr.some(skill => j.description.toLowerCase().includes(skill));
       return hasSkillTags || descriptionHasSkills;
    });
  }

  // 3. Date Posted
  if (datePosted && datePosted !== 'Any time') {
    const now = new Date();
    filtered = filtered.filter(j => {
      const pd = new Date(j.postedDate || j.postedAt);
      if(isNaN(pd.getTime())) return true;
      const diffMs = now.getTime() - pd.getTime();
      if (datePosted === 'Last 24 hours') return diffMs <= 86400000;
      if (datePosted === 'Last week') return diffMs <= 7 * 86400000;
      if (datePosted === 'Last month') return diffMs <= 30 * 86400000;
      return true;
    });
  }
  
  // 4. Match Score
  const sMin = scoreMin ? parseInt(scoreMin) : null;
  const sMax = scoreMax ? parseInt(scoreMax) : null;
  
  if (sMin !== null) {
     filtered = filtered.filter(j => (j.matchScore || 0) >= sMin);
  }
  if (sMax !== null) {
     filtered = filtered.filter(j => (j.matchScore || 0) <= sMax);
  }
  
  filtered = filtered.sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  // 5. Types & Work Modes & City Location
  if (type) {
    const types = type.split(',').map(t => t.toLowerCase());
    filtered = filtered.filter(job => {
      const jobT = (job.type || job.jobType || '').toLowerCase();
      // handle intern synonym mapping here physically as well 
      return types.some(t => jobT.includes(t) || (t.includes('intern') && jobT.includes('intern')));
    });
  }
  if (location) {
    const locations = location.split(',').map(l => l.toLowerCase());
    filtered = filtered.filter(job => locations.some(loc => {
      const jobLoc = (job.location || job.workMode || '').toLowerCase();
      // robust 'remote' maps to 'home' too
      return jobLoc.includes(loc) || (loc === 'remote' && jobLoc.includes('home'));
    }));
  }
  if (city) {
    const fuse = new Fuse(filtered, { keys: ['location'], threshold: 0.4 });
    const results = fuse.search(city);
    filtered = results.map(r => r.item);
  }

  // 6. Graceful Fallback Logic
  if (filtered.length === 0 && activeJobsDB.length > 0) {
     isFallback = true;
     // Return nearest generalized similar top matches if exact criteria fails
     filtered = activeJobsDB.slice(0, 5); 
  }
  
  const mappedResults = filtered.map(j => ({ ...j, type: j.jobType || j.type || 'Full-time', postedAt: j.postedDate || new Date().toISOString() }));
  return { data: mappedResults, isFallback };
});

// POST /jobs/sync - Trigger sync and merge manually
fastify.post('/jobs/sync', async (request, reply) => {
  try {
    const jobs = await syncAllJobs();
    return { success: true, count: jobs.length, message: "Jobs populated from APIs & Scraper" };
  } catch(e) {
    return reply.status(500).send({ error: e.message });
  }
});

// GET /auth/me - check session
fastify.get('/auth/me', async (request, reply) => {
  const email = request.headers['x-user-email'];
  if (!email || !usersDB.has(email)) return reply.status(401).send({ error: "Unauthorized" });
  
  const user = usersDB.get(email);
  return { email, applications: user.applications, hasResume: user.hasResume };
});

// POST /auth/login - init session
fastify.post('/auth/login', async (request, reply) => {
  const { email, password } = request.body;
  if (!email) return reply.status(400).send({ error: "Email required" });
  
  if (!usersDB.has(email)) {
    usersDB.set(email, { applications: [], resumeText: "", hasResume: false });
  }
  
  const user = usersDB.get(email);
  // Re-hydrate the memory fallback resume info for the agent if they have one
  if (user.hasResume) { setUserResumeText(user.resumeText); }
  
  return { success: true, user: { email, applications: user.applications, hasResume: user.hasResume } };
});

// GET /applications - track jobs
fastify.get('/applications', async (request, reply) => {
  const email = request.headers['x-user-email'];
  if (email && usersDB.has(email)) return usersDB.get(email).applications;
  return [];
});

// POST /applications - manual add
fastify.post('/applications', async (request, reply) => {
  const email = request.headers['x-user-email'];
  if (!email || !usersDB.has(email)) return reply.status(401).send({ error: "Unauthorized" });
  
  const newApp = request.body;
  newApp.id = Date.now().toString();
  usersDB.get(email).applications.unshift(newApp); 
  return { success: true, application: newApp };
});

// POST /resume/upload - accepts multipart PDF or TXT, extracts text
fastify.post('/resume/upload', async (request, reply) => {
  try {
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: "No file uploaded" });

    const buffer = await data.toBuffer();
    let rawText = "";

    if (data.mimetype === 'text/plain') {
      rawText = buffer.toString('utf-8');
    } else if (data.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else {
      return reply.status(400).send({ error: "Unsupported file format. Please upload PDF or TXT." });
    }
    
    const email = request.headers['x-user-email'];
    if (email && usersDB.has(email)) {
       const user = usersDB.get(email);
       user.resumeText = rawText;
       user.hasResume = true;
    }
    
    // Save text globally to allow future job syncs to AI rank them
    setUserResumeText(rawText);
    
    // 1. Extract dynamic query from resume using LangChain
    const extraction = await extractSearchQueries(rawText);
    const searchQueries = typeof extraction === 'string' ? [extraction] : (extraction.queries || [extraction.query]);
    const extractedSkills = typeof extraction === 'string' ? [extraction] : extraction.skills;
    
    console.log(`Deep Matching Triggered - Extracted Titles: ${JSON.stringify(searchQueries)}`);
    
    // 2. Fetch specific jobs targeted ONLY for this user's skills!
    const updatedJobs = await syncAllJobs(searchQueries);
    
    // 3. Score count evaluation
    const validMatchesCount = updatedJobs.filter(j => j.matchScore >= 60).length;

    return { 
      message: `Extracted ${searchQueries.join(', ')} and curated ${validMatchesCount} highly targeted roles exclusively for you.`, 
      extractedTextLength: rawText.length,
      extractedSkillsMock: extractedSkills,
      originalFileName: data.filename,
      scoresCalculated: validMatchesCount
    };
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Upload failed: " + err.message });
  }
});

// POST /api/chat - AI Assistant processing user chat vs unified UI filters
fastify.post('/api/chat', async (request, reply) => {
   try {
     const { messages, currentFilters } = request.body;
     if (!messages || !Array.isArray(messages)) return reply.status(400).send({ error: "Invalid messages format" });
     
     const aiResponse = await processChatIntent(messages, currentFilters, userResumeText);
     return { success: true, ...aiResponse };
   } catch (e) {
     console.error("AI Chat process error:", e);
     return reply.status(500).send({ error: "AI Chat processing failed." });
   }
});

// POST /chat - LangGraph Assistant (Legacy/Existing)
fastify.post('/chat', async (request, reply) => {
  try {
    const { messages } = request.body;
    const response = await processChat(messages);
    return response;
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: "Chat processing failed" });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '::' });
    console.log('Backend server is running at http://localhost:3001');
    // Pre-populate generic jobs on boot prior to resume upload
    await syncAllJobs();
    console.log('Jobs successfully pre-fetched and normalized into API.');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
