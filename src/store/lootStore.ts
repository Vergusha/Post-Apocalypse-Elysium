import { create } from 'zustand';
import { usePlayerStore } from './playerStore';

// Types for our items
export type ItemCategory = 
  | 'weapon' 
  | 'medical' 
  | 'food' 
  | 'ammo' 
  | 'tool' 
  | 'clothing' 
  | 'misc';

export interface LootItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: number; // 1-5, with 5 being the rarest
  weight: number; // For inventory management
  usable: boolean; // Can be used directly
  stackable: boolean; // Can stack multiple in one inventory slot
  quantity?: number; // For stackable items
  condition?: number; // 0-100%, only for applicable items
}

// Loot tables for different location types
interface LootTable {
  [locationType: string]: {
    common: string[];
    uncommon: string[];
    rare: string[];
  }
}

// Interface for the store
interface LootState {
  // Each location has its own inventory
  locationInventories: Record<string, LootItem[]>;
  
  // All possible items in the game
  items: Record<string, LootItem>;
  
  // Actions
  addItemToLocation: (locationId: string, itemId: string) => void;
  removeItemFromLocation: (locationId: string, itemId: string, quantity?: number) => void;
  moveItemToPlayer: (locationId: string, itemId: string, quantity?: number) => void;
  generateLoot: (locationId: string, locationType: string, searchEfficiency: number) => LootItem[];
  clearLocationLoot: (locationId: string) => void;
}

// Define all items in the game
const gameItems: Record<string, LootItem> = {
  'pistol': {
    id: 'pistol',
    name: 'Пистолет',
    description: 'Стандартный пистолет. Надежен и прост в использовании.',
    category: 'weapon',
    rarity: 2,
    weight: 2,
    usable: false,
    stackable: false,
    condition: 60,
  },
  'rifle': {
    id: 'rifle',
    name: 'Винтовка',
    description: 'Винтовка с оптическим прицелом. Эффективна на средних дистанциях.',
    category: 'weapon',
    rarity: 3,
    weight: 5,
    usable: false,
    stackable: false,
    condition: 45,
  },
  'medkit': {
    id: 'medkit',
    name: 'Медицинский набор',
    description: 'Базовый медицинский набор. Восстанавливает 40% здоровья.',
    category: 'medical',
    rarity: 2,
    weight: 1,
    usable: true,
    stackable: true,
  },
  'bandage': {
    id: 'bandage',
    name: 'Бинт',
    description: 'Стерильный бинт. Восстанавливает 15% здоровья.',
    category: 'medical',
    rarity: 1,
    weight: 0.2,
    usable: true,
    stackable: true,
  },
  'antibiotics': {
    id: 'antibiotics',
    name: 'Антибиотики',
    description: 'Лечат инфекционные заболевания и снижают радиацию на 20%.',
    category: 'medical',
    rarity: 3,
    weight: 0.5,
    usable: true,
    stackable: true,
  },
  'canned-meat': {
    id: 'canned-meat',
    name: 'Тушенка',
    description: 'Консервированное мясо. Уменьшает голод на 30%.',
    category: 'food',
    rarity: 1,
    weight: 1,
    usable: true,
    stackable: true,
  },
  'water': {
    id: 'water',
    name: 'Вода',
    description: 'Очищенная вода. Снижает жажду на 40%.',
    category: 'food',
    rarity: 1,
    weight: 1,
    usable: true,
    stackable: true,
  },
  'dried-fruits': {
    id: 'dried-fruits',
    name: 'Сухофрукты',
    description: 'Сушеные фрукты. Уменьшают голод на 20% и дают энергию.',
    category: 'food',
    rarity: 2,
    weight: 0.5,
    usable: true,
    stackable: true,
  },
  'pistol-ammo': {
    id: 'pistol-ammo',
    name: 'Патроны для пистолета',
    description: 'Патроны для пистолета, калибр 9мм.',
    category: 'ammo',
    rarity: 2,
    weight: 0.5,
    usable: false,
    stackable: true,
  },
  'rifle-ammo': {
    id: 'rifle-ammo',
    name: 'Патроны для винтовки',
    description: 'Патроны для винтовки, калибр 5.56мм.',
    category: 'ammo',
    rarity: 3,
    weight: 0.5,
    usable: false,
    stackable: true,
  },
  'flashlight': {
    id: 'flashlight',
    name: 'Фонарик',
    description: 'Фонарик. Помогает видеть в темных местах и находить более ценные предметы.',
    category: 'tool',
    rarity: 2,
    weight: 0.5,
    usable: true,
    stackable: false,
    condition: 70,
  },
  'toolkit': {
    id: 'toolkit',
    name: 'Набор инструментов',
    description: 'Базовый набор инструментов. Необходим для ремонта снаряжения.',
    category: 'tool',
    rarity: 3,
    weight: 3,
    usable: false,
    stackable: false,
    condition: 100,
  },
  'jacket': {
    id: 'jacket',
    name: 'Куртка',
    description: 'Прочная куртка. Защищает от холода и легких повреждений.',
    category: 'clothing',
    rarity: 2,
    weight: 2,
    usable: false,
    stackable: false,
    condition: 50,
  },
  'gas-mask': {
    id: 'gas-mask',
    name: 'Противогаз',
    description: 'Защищает от радиации и токсичных газов.',
    category: 'clothing',
    rarity: 4,
    weight: 1,
    usable: false,
    stackable: false,
    condition: 40,
  },
  'cigarettes': {
    id: 'cigarettes',
    name: 'Сигареты',
    description: 'Пачка сигарет. Ценный предмет для обмена.',
    category: 'misc',
    rarity: 1,
    weight: 0.1,
    usable: true,
    stackable: true,
  },
  'radio': {
    id: 'radio',
    name: 'Радио',
    description: 'Портативное радио. Может принимать сигналы от других выживших.',
    category: 'tool',
    rarity: 3,
    weight: 1,
    usable: true,
    stackable: false,
    condition: 60,
  },
  'fuel': {
    id: 'fuel',
    name: 'Топливо',
    description: 'Канистра с бензином. Необходима для транспорта.',
    category: 'misc',
    rarity: 2,
    weight: 5,
    usable: false,
    stackable: true,
  },
  'batteries': {
    id: 'batteries',
    name: 'Батарейки',
    description: 'Комплект батареек. Нужны для работы электрических приборов.',
    category: 'misc',
    rarity: 2,
    weight: 0.2,
    usable: false,
    stackable: true,
  },
  'map-fragment': {
    id: 'map-fragment',
    name: 'Фрагмент карты',
    description: 'Часть карты с отмеченными местами. Может открыть новые локации.',
    category: 'misc',
    rarity: 4,
    weight: 0.1,
    usable: true,
    stackable: true,
  },
};

// Loot tables for different location types
const lootTables: LootTable = {
  'city': {
    common: ['water', 'canned-meat', 'bandage', 'cigarettes', 'batteries'],
    uncommon: ['pistol-ammo', 'medkit', 'flashlight', 'jacket'],
    rare: ['pistol', 'radio', 'map-fragment', 'gas-mask'],
  },
  'ruins': {
    common: ['water', 'bandage', 'batteries'],
    uncommon: ['canned-meat', 'flashlight', 'cigarettes'],
    rare: ['toolkit', 'medkit', 'pistol'],
  },
  'forest': {
    common: ['bandage', 'water'],
    uncommon: ['dried-fruits', 'jacket'],
    rare: ['rifle', 'rifle-ammo'],
  },
  'military': {
    common: ['pistol-ammo', 'bandage'],
    uncommon: ['pistol', 'medkit', 'gas-mask'],
    rare: ['rifle', 'rifle-ammo', 'toolkit', 'radio'],
  },
  'hospital': {
    common: ['bandage', 'water'],
    uncommon: ['medkit', 'antibiotics'],
    rare: ['gas-mask'],
  },
  'gas-station': {
    common: ['water', 'batteries', 'cigarettes'],
    uncommon: ['fuel', 'toolkit'],
    rare: ['pistol-ammo'],
  },
};

export const useLootStore = create<LootState>((set, get) => ({
  locationInventories: {},
  items: gameItems,
  
  addItemToLocation: (locationId, itemId) => set((state) => {
    const item = state.items[itemId];
    if (!item) return state;
    
    const currentInventory = state.locationInventories[locationId] || [];
    
    // Check if this is a stackable item that already exists in the location
    if (item.stackable) {
      const existingItemIndex = currentInventory.findIndex(
        i => i.id === itemId && i.stackable
      );
      
      if (existingItemIndex >= 0) {
        // Stack with existing item
        const updatedInventory = [...currentInventory];
        const existingItem = updatedInventory[existingItemIndex];
        updatedInventory[existingItemIndex] = {
          ...existingItem,
          quantity: (existingItem.quantity || 1) + 1
        };
        
        return {
          locationInventories: {
            ...state.locationInventories,
            [locationId]: updatedInventory
          }
        };
      }
    }
    
    // Add as a new item
    const newItem = item.stackable 
      ? { ...item, quantity: 1 } 
      : item;
    
    return {
      locationInventories: {
        ...state.locationInventories,
        [locationId]: [...currentInventory, newItem]
      }
    };
  }),
  
  removeItemFromLocation: (locationId, itemId, quantity = 1) => set((state) => {
    const currentInventory = state.locationInventories[locationId] || [];
    const itemToRemove = currentInventory.find(item => item.id === itemId);
    
    if (!itemToRemove) return state;
    
    // If it's a stackable item with quantity > 1, just decrease the quantity
    if (itemToRemove.stackable && (itemToRemove.quantity || 0) > quantity) {
      return {
        locationInventories: {
          ...state.locationInventories,
          [locationId]: currentInventory.map(item => 
            item.id === itemId ? { ...item, quantity: (item.quantity || 1) - quantity } : item
          )
        }
      };
    }
    
    // Otherwise remove the item completely
    return {
      locationInventories: {
        ...state.locationInventories,
        [locationId]: currentInventory.filter(item => item.id !== itemId)
      }
    };
  }),
  
  moveItemToPlayer: (locationId, itemId, quantity = 1) => {
    const { removeItemFromLocation, items } = get();
    const addItem = usePlayerStore.getState().addItem;
    const item = items[itemId];
    
    if (item) {
      addItem(itemId, quantity);
      removeItemFromLocation(locationId, itemId, quantity);
    }
  },
  
  generateLoot: (locationId, locationType, searchEfficiency = 1) => {
    // Get the appropriate loot table
    const table = lootTables[locationType] || lootTables['ruins'];
    const { items, addItemToLocation } = get();
    
    // Number of items to generate based on search efficiency
    const itemCount = Math.floor(1 + Math.random() * Math.min(3, searchEfficiency));
    
    const foundItems: LootItem[] = [];
    
    // Generate random loot based on rarity
    for (let i = 0; i < itemCount; i++) {
      const roll = Math.random() * 100;
      let pool: string[];
      
      if (roll < 10 * searchEfficiency) {
        // Rare item (10% chance * efficiency)
        pool = table.rare;
      } else if (roll < 40 * searchEfficiency) {
        // Uncommon item (30% chance * efficiency)
        pool = table.uncommon;
      } else {
        // Common item (60% chance)
        pool = table.common;
      }
      
      // If pool is empty, default to common
      if (pool.length === 0) {
        pool = table.common;
      }
      
      // Pick a random item from the pool
      const itemId = pool[Math.floor(Math.random() * pool.length)];
      
      if (itemId) {
        const item = items[itemId];
        if (item) {
          // Create a unique instance ID for this specific item (for non-stackable items)
          const instanceId = !item.stackable ? `${itemId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : itemId;
          
          // Add variation to condition if applicable
          if (item.condition !== undefined) {
            const conditionVariance = Math.floor(Math.random() * 30) - 15; // +/- 15%
            const newItem = { 
              ...item, 
              id: instanceId,
              condition: Math.max(5, Math.min(100, item.condition + conditionVariance))
            };
            foundItems.push(newItem);
            addItemToLocation(locationId, newItem.id);
          } else {
            const newItem = item.stackable ? item : { ...item, id: instanceId };
            foundItems.push(newItem);
            addItemToLocation(locationId, newItem.id);
          }
        }
      }
    }
    
    return foundItems;
  },
  
  clearLocationLoot: (locationId) => set((state) => ({
    locationInventories: {
      ...state.locationInventories,
      [locationId]: []
    }
  })),
}));
