import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  type: string;
  postedAt: string;
  explanation?: string;
  source?: string;
  description?: string;
  url?: string;
}

interface JobState {
  jobs: Job[];
  isFallback: boolean;
  setJobs: (jobs: Job[], isFallback: boolean) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobs: [],
      isFallback: false,
      setJobs: (jobs, isFallback) => set({ jobs, isFallback }),
    }),
    { name: 'job-storage' }
  )
);
