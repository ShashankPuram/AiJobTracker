import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  title: string;
  skills: string[];
  datePosted: string;
  scoreMin: number | null;
  scoreMax: number | null;
  selectedTypes: string[];
  selectedLocations: string[];
  city: string;
  setTitle: (t: string) => void;
  setSkills: (s: string[]) => void;
  setDatePosted: (d: string) => void;
  setScoreMin: (s: number | null) => void;
  setScoreMax: (s: number | null) => void;
  setTypes: (types: string[]) => void;
  setLocations: (locations: string[]) => void;
  setCity: (city: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      title: "",
      skills: [],
      datePosted: "Any time",
      scoreMin: null,
      scoreMax: null,
      selectedTypes: [],
      selectedLocations: [],
      city: "",
      setTitle: (t) => set({ title: t }),
      setSkills: (s) => set({ skills: s }),
      setDatePosted: (d) => set({ datePosted: d }),
      setScoreMin: (s) => set({ scoreMin: s }),
      setScoreMax: (s) => set({ scoreMax: s }),
      setTypes: (types) => set({ selectedTypes: types }),
      setLocations: (locations) => set({ selectedLocations: locations }),
      setCity: (c) => set({ city: c }),
      clearFilters: () => set({ 
        title: "", skills: [], datePosted: "Any time", scoreMin: null, scoreMax: null, 
        selectedTypes: [], selectedLocations: [], city: "" 
      })
    }),
    { name: 'filter-storage' }
  )
);
