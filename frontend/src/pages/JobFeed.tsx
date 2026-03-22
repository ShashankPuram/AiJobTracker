import { useState, useEffect, useRef } from "react";
import { Building2, MapPin, Briefcase, Globe, Sparkles, Star, FileText } from "lucide-react";
import { useFilterStore } from "../store/useFilterStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { useJobStore, type Job } from "../store/useJobStore";

export default function JobFeed() {
  const { jobs, isFallback, setJobs } = useJobStore();
  const [loading, setLoading] = useState(jobs.length === 0);
  const hasResume = useAuthStore(state => state.hasResume);

  const { 
    title, skills, datePosted, scoreMin, scoreMax, selectedTypes, selectedLocations, city, 
    setTitle, setSkills, setDatePosted, setScoreMin, setScoreMax, setTypes, setLocations, setCity, clearFilters 
  } = useFilterStore();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (title) queryParams.set('title', title);
        if ((skills || []).length > 0) queryParams.set('skills', (skills || []).join(','));
        if (datePosted && datePosted !== 'Any time') queryParams.set('datePosted', datePosted);
        if (scoreMin !== null) queryParams.set('scoreMin', scoreMin.toString());
        if (scoreMax !== null) queryParams.set('scoreMax', scoreMax.toString());
        
        if ((selectedTypes || []).length > 0) queryParams.set('type', (selectedTypes || []).join(','));
        if ((selectedLocations || []).length > 0) queryParams.set('location', (selectedLocations || []).join(','));
        if (city) queryParams.set('city', city);
        
        const res = await fetch(`http://localhost:3001/jobs?${queryParams.toString()}`);
        const payload = await res.json();
        if (payload.data && Array.isArray(payload.data)) {
           setJobs(payload.data, payload.isFallback || false);
        } else if (Array.isArray(payload)) {
           setJobs(payload, false);
        } else {
           console.error("Backend returned Error payload instead of payload.data:", payload);
           setJobs([], false);
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    
    // De-bounce dynamic typing lookups
    const timeoutId = setTimeout(() => fetchJobs(), 400);
    return () => clearTimeout(timeoutId);
  }, [title, skills, datePosted, scoreMin, scoreMax, selectedTypes, selectedLocations, city]);

  const toggleArrayFilter = (current: string[] | null, setFn: (val: string[]) => void, item: string) => {
    const arr = current || [];
    setFn(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  if (!hasResume) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-[#121212] rounded-3xl border border-[#1F1F1F] shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-4">
        <div className="w-24 h-24 bg-[#1A1A1A] text-[#EF4444] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#EF4444]/20">
          <FileText className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-3">Resume Required</h2>
        <p className="text-[#A1A1AA] mb-8 max-w-lg text-[15px] font-medium leading-relaxed">
          Job listings will not be displayed until your resume is securely processed. Our AI requires your document to precisely extract your skills and dynamically curate your job feed!
        </p>
        <Link to="/resume" className="px-8 py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold tracking-wide rounded-[12px] transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] flex items-center gap-2 hover:-translate-y-0.5">
          Upload Resume Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full font-sans animate-fade-in-up items-start">
      {/* Comprehensive Sidebar */}
      <div className="w-72 flex-shrink-0 bg-[#121212] p-5 rounded-[16px] border border-[#1F1F1F] hidden lg:block custom-scrollbar overflow-y-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-10 transition-all sticky top-6 max-h-[calc(100vh-120px)] self-start">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#EF4444]" />
            Filters
          </h3>
          <button onClick={clearFilters} className="text-xs text-[#6B7280] hover:text-[#EF4444] transition-colors uppercase font-bold tracking-wider">
             Clear All
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Role / Title */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Role / Title</label>
            <input 
              type="text" 
              placeholder="e.g. Frontend Developer" 
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg text-sm text-white focus:bg-[#222] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all font-medium placeholder-[#6B7280]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">City / Location</label>
            <input 
              type="text" 
              placeholder="e.g. New York, India..." 
              value={city || ""}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg text-sm text-white focus:bg-[#222] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all font-medium placeholder-[#6B7280]"
            />
          </div>

          {/* Core Skills (Multi-select) */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Core Skills</label>
            <div className="grid grid-cols-2 gap-2">
              {['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Design'].map(skill => {
                const isActive = (skills || []).includes(skill);
                return (
                  <button 
                    key={skill}
                    onClick={() => toggleArrayFilter((skills || []), setSkills, skill)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      isActive ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 shadow-sm' : 'bg-[#1A1A1A] border border-[#1F1F1F] text-[#A1A1AA] hover:bg-[#222]'
                    }`}
                  >
                    {isActive ? <Star className="w-3 h-3 fill-[#EF4444]" /> : null}
                    {skill}
                  </button>
              )})}
            </div>
          </div>

          {/* Date Posted */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Date Posted</label>
            <select 
              value={datePosted || "Any time"}
              onChange={(e) => setDatePosted(e.target.value)}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg text-sm font-medium text-white focus:bg-[#222] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] cursor-pointer"
            >
              <option value="Any time">Any time</option>
              <option value="Last 24 hours">Last 24 hours</option>
              <option value="Last week">Last week</option>
              <option value="Last month">Last month</option>
            </select>
          </div>

          {/* AI Match Score Range */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-2">AI Match Score (%)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                min="0" max="100"
                value={scoreMin !== null ? scoreMin : ""}
                onChange={(e) => setScoreMin(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg text-sm text-white focus:bg-[#222] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all font-medium placeholder-[#6B7280]"
              />
              <span className="text-[#6B7280] font-bold">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                min="0" max="100"
                value={scoreMax !== null ? scoreMax : ""}
                onChange={(e) => setScoreMax(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg text-sm text-white focus:bg-[#222] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all font-medium placeholder-[#6B7280]"
              />
            </div>
          </div>

          <div className="h-px bg-[#1F1F1F] my-4" />

          {/* Job Type */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-3">Job Type</label>
            <div className="space-y-2.5">
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleArrayFilter((selectedTypes || []), setTypes, type)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${(selectedTypes || []).includes(type) ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#333] group-hover:border-[#EF4444]'}`}>
                    {(selectedTypes || []).includes(type) && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                  </div>
                  <span className="text-[13px] font-medium text-[#A1A1AA] group-hover:text-white">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-3">Work Mode</label>
            <div className="space-y-2.5">
              {['Remote', 'Hybrid', 'On-site'].map(model => (
                <label key={model} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleArrayFilter((selectedLocations || []), setLocations, model)}>
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${(selectedLocations || []).includes(model) ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#333] group-hover:border-[#EF4444]'}`}>
                    {(selectedLocations || []).includes(model) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[13px] font-medium text-[#A1A1AA] group-hover:text-white">{model}</span>
                </label>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 space-y-4 pb-10">
        <div className="flex justify-between items-end mb-6 animate-slide-up">
           <div>
             <h1 className="text-3xl font-bold text-white tracking-tight">Curated Matches</h1>
             <p className="text-[#A1A1AA] text-[15px] mt-1.5 font-medium">Dynamically sorted with AI resume intelligence.</p>
           </div>
           <div className="text-sm font-bold text-[#EF4444] bg-[#EF4444]/10 px-4 py-1.5 rounded-full shadow-sm border border-[#EF4444]/20">
             {jobs.length} Results
           </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
             <div className="w-10 h-10 border-4 border-[#1F1F1F] border-t-[#EF4444] rounded-full animate-spin mb-5" />
             <div className="text-[#6B7280] font-semibold uppercase tracking-widest text-sm">Synthesizing Roles...</div>
           </div>
        ) : jobs.length === 0 ? (
           <div className="py-20 text-center text-[#A1A1AA] font-medium bg-[#121212] rounded-2xl border border-dashed border-[#333]">
             No jobs found precisely matching these strict criteria. Try unchecking some filters!
           </div>
        ) : (
          <>
            {isFallback && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-sm font-medium flex items-center gap-3">
                 <span>⚠️</span>
                 No exact matching jobs found. However, we're showing you similar generalized roles that closely align!
              </div>
            )}
            
            {/* Best Matches Section */}
            {jobs.filter(j => (j.matchScore || 0) >= 70).length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  Best Matches
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                  {jobs.filter(j => (j.matchScore || 0) >= 70).slice(0, 12).map(job => (
                    <JobCard key={`best-${job.id}`} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* Other Roles Section */}
            {jobs.filter(j => (j.matchScore || 0) < 70).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Other Roles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                  {jobs.filter(j => (j.matchScore || 0) < 70).map(job => (
                    <JobCard key={`other-${job.id}`} job={job} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

// Inner Functional Component for Job Cards
function JobCard({ job }: { job: Job }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const checkOverflow = () => {
    if (titleRef.current) {
      setIsOverflowing(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  };

  const getBadgeStyle = (score: number) => {
    if (score >= 70) return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 shadow-sm';
    if (score >= 40) return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 shadow-sm';
    return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 shadow-sm';
  };

  const getEmoji = (score: number) => {
    if (score >= 70) return '🟢';
    if (score >= 40) return '🟡';
    return '🔴';
  };

  return (
    <div 
      onMouseEnter={checkOverflow}
      className="bg-[#121212] rounded-[16px] p-5 border border-[#1F1F1F] shadow-md transition-all duration-300 ease-in-out group relative overflow-hidden flex flex-col animate-slide-up h-full hover:border-[rgba(239,68,68,0.6)] hover:shadow-[0_0_8px_rgba(239,68,68,0.4),0_0_16px_rgba(255,0,128,0.2),0_0_24px_rgba(239,68,68,0.2)] hover:-translate-y-[6px] hover:scale-[1.01] hover:bg-[linear-gradient(145deg,#121212,rgba(239,68,68,0.05))]"
    >
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-[#1A1A1A] border border-[#1F1F1F] rounded-[10px] flex items-center justify-center flex-shrink-0 text-[#EF4444] group-hover:bg-[#EF4444] group-hover:text-white group-hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-300 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
            <h2 
              ref={titleRef}
              style={{ animationDelay: '0.5s' }}
              className={`text-[16px] font-bold text-gray-100 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-[4000ms] ease-linear inline-block max-w-full ${isOverflowing ? 'group-hover:overflow-visible group-hover:animate-[marquee_4s_linear_infinite_alternate]' : ''}`}
            >
              {job.title}
            </h2>
            <div className="text-[#A1A1AA] font-medium text-[13px] mt-0.5 line-clamp-1">{job.company}</div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 border flex-shrink-0 shadow-sm ${getBadgeStyle(job.matchScore || 0)}`}>
          <span>{getEmoji(job.matchScore || 0)}</span>
          <span>{job.matchScore || 0}% Match</span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-3 text-[12px] font-medium text-[#6B7280] pt-2">
        <span className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#1F1F1F] px-2.5 py-1 rounded-md text-[#A1A1AA]"><MapPin className="w-3.5 h-3.5 text-[#6B7280]" />{job.location}</span>
        <span className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#1F1F1F] px-2.5 py-1 rounded-md text-[#A1A1AA]"><Briefcase className="w-3.5 h-3.5 text-[#EF4444]" />{job.type}</span>
        {job.source && (
          <span className="flex items-center gap-1 text-[#E5E7EB] font-bold bg-[#1F2937] border border-[#374151] px-2 py-1 rounded-md uppercase tracking-widest text-[9px] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors cursor-default shadow-sm">
            <Globe className="w-3 h-3" />
            {job.source.replace('api-', '').replace('scraper-', '')}
          </span>
        )}
      </div>
      
      {job.description && (
        <p className="mt-4 text-[13px] text-[#A1A1AA] line-clamp-2 leading-relaxed font-medium mb-4">
          {job.description || ''}
        </p>
      )}

      {/* AI Insights & Matches */}
      {job.explanation && (
        <div className="mt-auto mb-5 p-3 bg-[#1A1A1A]/90 border-l-[3px] border-[#3B82F6] rounded-r-lg rounded-l-sm text-[12px] text-[#D1D5DB] leading-relaxed shadow-sm transition-all hover:bg-[rgba(59,130,246,0.08)] group-hover:border-[#60A5FA]">
          <span className="font-bold text-[#3B82F6] mr-2 inline-flex items-center gap-1 uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3" /> Insight:
          </span>
          <span className="font-medium line-clamp-2">{job.explanation}</span>
        </div>
      )}

      <div className="pt-4 border-t border-[#1F1F1F] flex justify-between items-center mt-auto">
         <span className="text-[12px] font-medium text-[#6B7280]">{new Date(job.postedAt || Date.now()).toLocaleDateString()}</span>
         <a 
           href={job.url || "#"} 
           target="_blank" 
           rel="noopener noreferrer"
           onClick={() => {
             console.log("[JobCard] Setting localStorage tracking for:", job.title);
             localStorage.setItem('pendingTrackingJob', JSON.stringify(job));
           }}
           className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-bold rounded-[8px] transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(239,68,68,0.25)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:-translate-y-0.5"
         >
           Apply Now
         </a>
      </div>
    </div>
  );
}
