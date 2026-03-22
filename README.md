# AI Job Tracker

A full-stack, AI-powered platform designed to intelligently match your resume against live job listings, provide deep insights, and rigorously track your application pipeline. 

## Features

- **AI Job Matching:** Upload your resume and let LangChain securely extract your core skills to dynamically curate your job feed.
- **Premium Dark UI:** A robust, modern interface featuring a curated `#0B0B0B` dark theme, neon hover glows, and intelligent marquee animations.
- **Advanced Job Feed:** Consolidated listings from global APIs and scrapers, dynamically scored based on your resume.
- **Application Board:** Track the lifecycle of your applications with a Kanban-inspired dashboard with visual timelines.
- **AI Assistant:** Consult the integrated Chat Agent regarding opportunities.

## Project Structure

- `/frontend`: React + Vite + Tailwind CSS + Zustand
- `/backend`: Node.js + Fastify + LangChain + Puppeteer

## Setup Instructions

### 1. Backend

Navigate to the backend directory, install packages, and start the Fastify server:

```bash
cd backend
npm install
```

Ensure your backend `.env` file is properly configured:
```properties
# Add your Keys
OPENAI_API_KEY=your_key_here
```

Start the Dev server:
```bash
npm run dev
```

### 2. Frontend

Navigate to the frontend directory, install dependencies, and launch Vite:

```bash
cd frontend
npm install
npm run dev
```

Access the UI at `http://localhost:5173/`. Your local backend API points seamlessly to `http://127.0.0.1:3001/`.

## License

MIT
