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
}

export const usePlayerStore = create<PlayerState>((set) => ({
  name: 'Выживший',
  health: 100,
  hunger: 50,
  radiation: 0,
  // Добавим начальные предметы для тестирования
  inventory: [
    'weapon:pistol', 
    'ammo:pistol', 
    'medical:medkit', 
    'food:canned-meat', 
    'food:water',
    'tool:flashlight'
  ],
  setName: (name) => set({ name }),
  takeDamage: (amount) =>
    set((state) => ({ health: Math.max(state.health - amount, 0) })),
  eat: (amount) =>
    set((state) => ({ hunger: Math.max(state.hunger - amount, 0) })),
  addItem: (item) =>
    set((state) => ({ inventory: [...state.inventory, item] })),
  removeItem: (item) =>
    set((state) => ({ 
      inventory: state.inventory.filter((i, index) => 
        index !== state.inventory.indexOf(item)
      ) 
    })),
}));
