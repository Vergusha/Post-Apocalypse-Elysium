import { create } from 'zustand';
import { LootItem } from './lootStore';

interface PlayerInventoryItem {
  id: string;
  quantity?: number;
}

interface PlayerState {
  name: string;
  health: number;
  hunger: number;
  radiation: number;
  inventory: PlayerInventoryItem[];
  setName: (name: string) => void;
  takeDamage: (amount: number) => void;
  eat: (amount: number) => void;
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  hasItem: (itemId: string, quantity?: number) => boolean;
  getItemQuantity: (itemId: string) => number;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  name: 'Выживший',
  health: 100,
  hunger: 50,
  radiation: 0,
  // Добавим начальные предметы для тестирования
  inventory: [
    { id: 'pistol', quantity: 1 }, 
    { id: 'pistol-ammo', quantity: 24 }, 
    { id: 'medkit', quantity: 2 }, 
    { id: 'canned-meat', quantity: 3 }, 
    { id: 'water', quantity: 5 },
    { id: 'flashlight', quantity: 1 }
  ],
  setName: (name) => set({ name }),
  takeDamage: (amount) =>
    set((state) => ({ health: Math.max(state.health - amount, 0) })),
  eat: (amount) =>
    set((state) => ({ hunger: Math.max(state.hunger - amount, 0) })),
  
  addItem: (itemId, quantity = 1) => 
    set((state) => {
      // Check if the item already exists in inventory
      const existingItemIndex = state.inventory.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedInventory = [...state.inventory];
        updatedInventory[existingItemIndex] = {
          ...updatedInventory[existingItemIndex],
          quantity: (updatedInventory[existingItemIndex].quantity || 1) + quantity
        };
        return { inventory: updatedInventory };
      } else {
        // Add new item to inventory
        return { 
          inventory: [...state.inventory, { id: itemId, quantity: quantity }] 
        };
      }
    }),
  
  removeItem: (itemId, quantity = 1) =>
    set((state) => {
      const existingItemIndex = state.inventory.findIndex(item => item.id === itemId);
      
      if (existingItemIndex === -1) return state; // Item not found
      
      const existingItem = state.inventory[existingItemIndex];
      const currentQuantity = existingItem.quantity || 1;
      
      // If removing less than the total quantity
      if (currentQuantity > quantity) {
        const updatedInventory = [...state.inventory];
        updatedInventory[existingItemIndex] = {
          ...existingItem,
          quantity: currentQuantity - quantity
        };
        return { inventory: updatedInventory };
      }
      
      // Otherwise remove the item completely
      return { 
        inventory: state.inventory.filter((_, index) => index !== existingItemIndex) 
      };
    }),
  
  hasItem: (itemId, quantity = 1) => {
    const item = get().inventory.find(i => i.id === itemId);
    return item ? (item.quantity || 1) >= quantity : false;
  },
  
  getItemQuantity: (itemId) => {
    const item = get().inventory.find(i => i.id === itemId);
    return item ? (item.quantity || 1) : 0;
  }
}));
