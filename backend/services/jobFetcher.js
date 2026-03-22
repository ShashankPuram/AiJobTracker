import axios from 'axios';

const stripHtml = (html) => {
  if (!html) return '';
  // Remove HTML tags and common entities cleanly to prevent UI breaking
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
};

export async function fetchRemotiveJobs(category = 'software-dev', query = '') {
  try {
    const url = query 
      ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=15`
      : `https://remotive.com/api/remote-jobs?category=${category}&limit=15`;
      
    const res = await axios.get(url);
    const jobs = res.data.jobs || [];
    
    return jobs.map(j => ({
      id: `remotive_${j.id}`,
      title: j.title || 'Unknown Title',
      company: j.company_name || 'Unknown Company',
      location: j.candidate_required_location || 'Remote',
      description: stripHtml(j.description).substring(0, 300) + '...',
      skills: j.tags || [],
      jobType: j.job_type === 'full_time' ? 'Full-time' : 'Contract',
      workMode: 'Remote',
      postedDate: j.publication_date || new Date().toISOString(),
      source: 'api-remotive',
      salary: j.salary || 'Competitive',
      url: j.url
    }));
  } catch (error) {
    console.error("Remotive API fetch failed:", error.message);
    return [];
  }
}

export async function fetchAdzunaJobs(query = 'developer') {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    console.log("ℹ️ Skipping Adzuna API fetch (Requires credentials)");
    return [];
  }
  try {
    // Switched endpoint to 'in' to strictly pull jobs located in India as requested.
    const res = await axios.get(`https://api.adzuna.com/v1/api/jobs/in/search/1`, {
      params: { app_id: appId, app_key: appKey, results_per_page: 15, what: query }
    });
    const jobs = res.data.results || [];
    
    return jobs.map(j => ({
      id: `adzuna_${j.id}`,
      title: j.title,
      company: j.company?.display_name || 'Unknown',
      location: j.location?.display_name || 'India',
      description: stripHtml(j.description).substring(0, 300) + '...',
      skills: [], 
      jobType: j.contract_type === 'contract' ? 'Contract' : 'Full-time',
      workMode: 'Unspecified',
      postedDate: j.created || new Date().toISOString(),
      source: 'api-adzuna',
      salary: j.salary_min ? `$${j.salary_min}` : 'Competitive',
      url: j.redirect_url
    }));
  } catch (error) {
    console.error("Adzuna API fetch failed:", error.message);
    return [];
  }
}
