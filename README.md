# 🚀 AI JobTracker

An intelligent job tracking and recommendation platform powered by AI.
It helps users discover relevant jobs, track applications, and interact with a smart assistant that understands natural language.

---

# 🧠 Architecture Diagram

```
Frontend (React + Zustand)
        ↓
Backend (Node.js / Fastify)
        ↓
-----------------------------------
|  External Job APIs / Scrapers   |
|  (LinkedIn, Adzuna, etc.)       |
-----------------------------------
        ↓
LangChain (Job Matching Engine)
        ↓
LangGraph (AI Assistant Flow)
        ↓
Response → Frontend UI
```

### Data Flow:

1. User uploads resume / applies filters
2. Backend fetches jobs (APIs / scraping)
3. LangChain processes:

   * Resume parsing
   * Job matching
4. LangGraph handles:

   * Intent detection
   * Filter actions
   * Chat responses
5. Processed data sent to frontend

---

# ⚙️ Setup Instructions

## Prerequisites

* Node.js (v18+)
* npm / yarn
* Git

---

## 🔧 Local Setup

### 1. Clone Repo

```bash
git clone https://github.com/your-username/ai-job-tracker.git
cd ai-job-tracker
```

### 2. Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

---

## 🌱 Environment Variables

Create `.env` in backend:

```
OPENAI_API_KEY=
SCRAPER_API_KEY=
PORT=3001
```

---

## ▶️ Run Project

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

---

# 🤖 LangChain & LangGraph Usage

## 🔹 LangChain (Job Matching)

Used for:

* Resume parsing
* Skill extraction
* Job relevance scoring

Flow:

1. Extract skills from resume
2. Compare with job descriptions
3. Assign match score

---

## 🔹 LangGraph (AI Assistant)

Handles:

* Intent detection
* Action routing
* Conversation state

### Graph Structure:

Nodes:

* Input Node (User message)
* Intent Classifier
* Action Router
* Tool Executor (Filters / Search)
* Response Generator

---

## 🔹 Tool Calling

AI can:

* Update filters (location, role, score)
* Trigger job search
* Clear filters

Example:
"Show remote ML jobs"
→ Updates UI filters directly

---

## 🔹 Prompt Design

* Structured prompts for:

  * Intent detection
  * Filter extraction
  * Conversational tone

* Ensures:

  * Human-like responses
  * Accurate UI actions

---

## 🔹 State Management

* Zustand used in frontend
* Maintains:

  * Filters
  * Job list
  * Chat state

---

# 🎯 AI Matching Logic

## Scoring Approach

Match score based on:

* Skill overlap
* Role similarity
* Keyword matching

Example:

```
Score = (Skill Match % + Role Relevance % + Keyword Score) / 3
```

---

## Why It Works

* Combines semantic + keyword matching
* Uses AI understanding (not just exact match)
* Adapts to resume context

---

## Performance

* Lightweight scoring
* Pre-filtering reduces load
* Efficient for real-time use

---

# 💬 Popup Flow Design

## Why This Design

* Triggered when user returns from "Apply Now"
* Makes system proactive (not passive)

---

## Behavior

* Detects tab focus
* Shows contextual popup:
  "Did you apply for this job?"

---

## Edge Cases Handled

* Multiple tab switching
* Missing job context
* Popup not triggering (fallback logic)

---

## Alternatives Considered

* Full modal (rejected → too intrusive)
* Silent tracking (rejected → no user control)

---

# 🤖 AI Assistant UI Choice

## Chosen: Floating Chat Bubble

### Why:

* Non-intrusive
* Always accessible
* Familiar UX (like modern apps)

---

## UX Benefits

* Doesn't block content
* Easy interaction
* Context-aware help

---

# 📈 Scalability

## Handles 100+ Jobs

* Pagination / lazy loading
* Efficient filtering

---

## Handles 10,000 Users

* Stateless backend APIs
* Scalable deployment (Vercel + Render)
* API-based architecture

---

# ⚖️ Tradeoffs

## Limitations

* Scraping may be slow (free tier)
* Backend cold starts (Render)
* AI latency (API calls)

---

## Improvements (Future)

* Better ranking model
* Real-time job updates
* User analytics dashboard
* Caching layer (Redis)

---

# 🌍 Deployment

Frontend:

* Vercel

Backend:

* Render

---

# 💡 Final Note

This project demonstrates:

* AI-powered job matching
* Intelligent UI interactions
* Scalable full-stack architecture

---

⭐ Built with focus on real-world product experience
