import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface TimelineEvent {
  status: AppStatus;
  date: string;
}

export interface Application {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  status: AppStatus;
  appliedDate: string;
  timeline: TimelineEvent[];
}

interface ApplicationState {
  applications: Application[];
  addApplication: (job: any, initialStatus?: AppStatus) => void;
  updateStatus: (id: string, newStatus: AppStatus) => void;
  deleteApplication: (id: string) => void;
  setApplications: (apps: Application[]) => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      applications: [],
      setApplications: (apps) => set({ applications: apps }),
      addApplication: (job, initialStatus = 'Applied') => set((state) => {
        // Prevent duplicate job saves
        if (state.applications.some(app => app.jobId === job.id)) {
          return state;
        }
        const now = new Date().toISOString();
        const newApp: Application = {
          id: Math.random().toString(36).substring(7),
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location || '',
          salary: job.salary || '',
          status: initialStatus,
          appliedDate: now,
          timeline: [{ status: initialStatus, date: now }]
        };
        return { applications: [newApp, ...state.applications] };
      }),
      updateStatus: (id, newStatus) => set((state) => ({
        applications: state.applications.map(app => {
          if (app.id === id && app.status !== newStatus) {
             const now = new Date().toISOString();
             
             // Deduplicate: remove any existing entry for this status
             const filteredTimeline = app.timeline.filter(t => t.status !== newStatus);
             const newTimeline = [...filteredTimeline, { status: newStatus, date: now }];
             
             // Sort timeline by logical progression
             const statusOrder: Record<AppStatus, number> = { 'Applied': 1, 'Interview': 2, 'Offer': 3, 'Rejected': 3 };
             newTimeline.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

             return {
               ...app,
               status: newStatus,
               timeline: newTimeline
             };
          }
          return app;
        })
      })),
      deleteApplication: (id) => set((state) => ({
        applications: state.applications.filter(app => app.id !== id)
      }))
    }),
    {
      name: 'application-storage'
    }
  )
);
