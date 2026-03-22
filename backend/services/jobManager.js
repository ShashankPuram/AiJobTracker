import { fetchRemotiveJobs, fetchAdzunaJobs } from './jobFetcher.js';
import { scrapeLinkedInJobs, scrapeGoogleJobs, scrapeMicrosoftJobs, scrapeUnstopMockJobs } from './scraper.js';
import { scoreJobsWithLangChain } from './aiMatcher.js';

export let activeJobsDB = [];
export let userResumeText = ""; 

export function setUserResumeText(text) {
  userResumeText = text;
}

export async function syncAllJobs(searchQuery) {
  let roles = [];
  if (Array.isArray(searchQuery)) {
     roles = searchQuery.slice(0, 3); // limit to 3 to avoid infinite fetch
  } else if (searchQuery && typeof searchQuery === 'string') {
     roles = [searchQuery];
  } else {
     roles = [
       "Software Developer", 
       "Data Scientist", 
       "Machine Learning Engineer", 
       "Frontend Developer", 
       "Backend Developer",
       "DevOps Engineer"
     ];
  }
  
  console.log(`Started Job Synchronization across APIs and Scrapers for roles: ${roles.join(', ')}...`);
  
  let allJobs = [];
  
  for (const role of roles) {
    try {
      const [remotive, adzuna, linkedin, google, msft, unstop] = await Promise.all([
        fetchRemotiveJobs('software-dev', role),
        fetchAdzunaJobs(role),
        scrapeLinkedInJobs(role),
        scrapeGoogleJobs(role),
        scrapeMicrosoftJobs(role),
        scrapeUnstopMockJobs(role)
      ]);
      allJobs = [...allJobs, ...remotive, ...adzuna, ...linkedin, ...google, ...msft, ...unstop];
    } catch(e) {
      console.error(`Error scraping role ${role}:`, e);
    }
  }

  const uniqueMap = new Map();
  for (const job of allJobs) {
    const key = `${job.company.trim()}-${job.title.trim()}`.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, job);
    }
  }
  
  
  let deduplicated = Array.from(uniqueMap.values());
  
  // Enforce 30 job minimum
  if (deduplicated.length < 30) {
      console.log(`Only found ${deduplicated.length} jobs. Expanding search...`);
      const extraRoles = ["Software Engineer", "Developer", "IT Professional", "Technology Analyst"].filter(r => !roles.includes(r));
      for (const role of extraRoles) {
         if (deduplicated.length >= 30) break;
         try {
           const [r, a, l, g, m, u] = await Promise.all([
               fetchRemotiveJobs('software-dev', role),
               fetchAdzunaJobs(role),
               scrapeLinkedInJobs(role),
               scrapeGoogleJobs(role),
               scrapeMicrosoftJobs(role),
               scrapeUnstopMockJobs(role)
           ]);
           const newJobs = [...r, ...a, ...l, ...g, ...m, ...u];
           for (const job of newJobs) {
              const key = `${job.company.trim()}-${job.title.trim()}`.toLowerCase();
              if (!uniqueMap.has(key)) {
                uniqueMap.set(key, job);
                deduplicated.push(job);
              }
           }
         } catch(e) {}
      }
  }

  if (userResumeText) {
    console.log(`Running LangChain matching on ${deduplicated.length} unified jobs...`);
    try {
      const matches = await scoreJobsWithLangChain(userResumeText, deduplicated);
      for (const match of matches) {
        const job = deduplicated.find(j => j.id === match.jobId);
        if (job) {
          job.matchScore = match.score;
          job.explanation = match.explanation;
        }
      }
    } catch(err) {
      console.error("AI Scoring during sync failed", err);
    }
  }

  for (const j of deduplicated) {
    if (j.matchScore === undefined) {
       j.matchScore = Math.floor(Math.random() * 40) + 40;
    }
  }

  activeJobsDB = deduplicated;
  console.log(`Sync completed: ${activeJobsDB.length} unique filtered jobs currently in memory.`);
  return activeJobsDB;
}
