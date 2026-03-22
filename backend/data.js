export const dummyJobs = [
  { id: "1", title: "Senior AI Engineer", company: "TechNova", location: "San Francisco, CA (Hybrid)", salary: "$160k - $200k", matchScore: 98, type: "Full-time", postedAt: "2h ago" },
  { id: "2", title: "Frontend Developer", company: "Stellar Tech", location: "Remote", salary: "$120k - $150k", matchScore: 85, type: "Full-time", postedAt: "5h ago" },
  { id: "3", title: "Backend Node.js Developer", company: "CloudSync", location: "New York, NY", salary: "$130k - $160k", matchScore: 92, type: "Full-time", postedAt: "1d ago" },
  { id: "4", title: "Machine Learning Researcher", company: "DeepMind", location: "London, UK (Remote)", salary: "$180k - $220k", matchScore: 78, type: "Contract", postedAt: "2d ago" }
];

export const usersDB = new Map();

// Pre-populate test user
usersDB.set("test@gmail.com", {
  applications: [
    { id: "1", jobId: "1", title: "Senior AI Engineer", company: "TechNova", location: "San Francisco", salary: "$160k", status: "Interview", appliedDate: new Date().toISOString(), timeline: [{ status: "Interview", date: new Date().toISOString() }] },
    { id: "2", jobId: "2", title: "Backend Node.js Developer", company: "CloudSync", location: "New York", salary: "$130k", status: "Applied", appliedDate: new Date().toISOString(), timeline: [{ status: "Applied", date: new Date().toISOString() }] }
  ],
  resumeText: "",
  hasResume: false
});
