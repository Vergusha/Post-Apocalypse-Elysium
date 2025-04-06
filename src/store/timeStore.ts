import { create } from 'zustand';

export type DayPhase = 'morning' | 'day' | 'evening' | 'night';

interface TimeState {
  day: number;
  hour: number;
  minute: number;
  paused: boolean;
  dayPhase: DayPhase;
  
  // Actions
  advanceTime: (minutes: number) => void;
  togglePause: () => void;
  setTime: (day: number, hour: number, minute: number) => void;
}

// Helper function to determine day phase based on hour
const getDayPhase = (hour: number): DayPhase => {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

export const useTimeStore = create<TimeState>((set) => ({
  day: 1,
  hour: 8, // Game starts at 8:00 AM
  minute: 0,
  paused: false,
  dayPhase: 'morning',
  
  advanceTime: (minutes) => set((state) => {
    let newMinute = state.minute + minutes;
    let newHour = state.hour;
    let newDay = state.day;
    
    // Handle minute overflow
    while (newMinute >= 60) {
      newMinute -= 60;
      newHour++;
    }
    
    // Handle hour overflow
    while (newHour >= 24) {
      newHour -= 24;
      newDay++;
    }
    
    const newDayPhase = getDayPhase(newHour);
    
    return {
      minute: newMinute,
      hour: newHour,
      day: newDay,
      dayPhase: newDayPhase
    };
  }),
  
  togglePause: () => set((state) => ({ paused: !state.paused })),
  
  setTime: (day, hour, minute) => set({
    day,
    hour,
    minute,
    dayPhase: getDayPhase(hour)
  })
}));

// Helper functions to format time
export const formatTime = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const formatDayTime = (day: number, hour: number, minute: number): string => {
  return `День ${day}, ${formatTime(hour, minute)}`;
};
