import { create } from 'zustand';

interface PlayerState {
  name: string;
  health: number;
  hunger: number;
  radiation: number;
  inventory: string[];
  setName: (name: string) => void;
  takeDamage: (amount: number) => void;
  eat: (amount: number) => void;
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  hasItem: (item: string) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  name: 'Выживший',
  health: 100,
  hunger: 50,
  radiation: 0,
  // Добавим начальные предметы для тестирования
  inventory: [
    'pistol', 
    'pistol-ammo', 
    'medkit', 
    'canned-meat', 
    'water',
    'flashlight'
  ],
  setName: (name) => set({ name }),
  takeDamage: (amount) =>
    set((state) => ({ health: Math.max(state.health - amount, 0) })),
  eat: (amount) =>
    set((state) => ({ hunger: Math.max(state.hunger - amount, 0) })),
  addItem: (item) =>
    set((state) => ({ inventory: [...state.inventory, item] })),
  removeItem: (itemId) =>
    set((state) => ({ 
      inventory: state.inventory.filter((id) => id !== itemId) 
    })),
  hasItem: (itemId) => get().inventory.includes(itemId)
}));
