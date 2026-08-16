import { create } from 'zustand';

interface MeetingState {
  activeMeetingId: string | null;
  isInMeeting: boolean;
  setActiveMeeting: (id: string | null) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  activeMeetingId: null,
  isInMeeting: false,
  setActiveMeeting: (id) => set({ activeMeetingId: id, isInMeeting: !!id }),
}));
