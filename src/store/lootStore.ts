import { create } from 'zustand';

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
  removeItemFromLocation: (locationId: string, itemId: string) => void;
  moveItemToPlayer: (locationId: string, itemId: string) => void;
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
    condition: 45,
  },
  'medkit': {
    id: 'medkit',
    name: 'Медицинский набор',
    description: 'Базовый медицинский набор. Восстанавливает здоровье.',
    category: 'medical',
    rarity: 2,
    weight: 1,
    usable: true,
  },
  'bandage': {
    id: 'bandage',
    name: 'Бинт',
    description: 'Стерильный бинт. Останавливает кровотечение.',
    category: 'medical',
    rarity: 1,
    weight: 0.2,
    usable: true,
  },
  'antibiotics': {
    id: 'antibiotics',
    name: 'Антибиотики',
    description: 'Лечат инфекционные заболевания.',
    category: 'medical',
    rarity: 3,
    weight: 0.5,
    usable: true,
  },
  'canned-meat': {
    id: 'canned-meat',
    name: 'Тушенка',
    description: 'Консервированное мясо. Утоляет голод и дает силы.',
    category: 'food',
    rarity: 1,
    weight: 1,
    usable: true,
  },
  'water': {
    id: 'water',
    name: 'Вода',
    description: 'Очищенная вода. Необходима для выживания.',
    category: 'food',
    rarity: 1,
    weight: 1,
    usable: true,
  },
  'dried-fruits': {
    id: 'dried-fruits',
    name: 'Сухофрукты',
    description: 'Сушеные фрукты. Хорошо сохраняются, содержат полезные вещества.',
    category: 'food',
    rarity: 2,
    weight: 0.5,
    usable: true,
  },
  'pistol-ammo': {
    id: 'pistol-ammo',
    name: 'Патроны для пистолета',
    description: 'Патроны для пистолета. 9мм.',
    category: 'ammo',
    rarity: 2,
    weight: 0.5,
    usable: false,
  },
  'rifle-ammo': {
    id: 'rifle-ammo',
    name: 'Патроны для винтовки',
    description: 'Патроны для винтовки. 5.56мм.',
    category: 'ammo',
    rarity: 3,
    weight: 0.5,
    usable: false,
  },
  'flashlight': {
    id: 'flashlight',
    name: 'Фонарик',
    description: 'Фонарик. Помогает видеть в темных местах.',
    category: 'tool',
    rarity: 2,
    weight: 0.5,
    usable: true,
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
  },
  'jacket': {
    id: 'jacket',
    name: 'Куртка',
    description: 'Прочная куртка. Защищает от холода и легких повреждений.',
    category: 'clothing',
    rarity: 2,
    weight: 2,
    usable: false,
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
  },
  'radio': {
    id: 'radio',
    name: 'Радио',
    description: 'Портативное радио. Может принимать сигналы от других выживших.',
    category: 'tool',
    rarity: 3,
    weight: 1,
    usable: true,
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
  },
  'batteries': {
    id: 'batteries',
    name: 'Батарейки',
    description: 'Комплект батареек. Нужны для работы электрических приборов.',
    category: 'misc',
    rarity: 2,
    weight: 0.2,
    usable: false,
  },
  'map-fragment': {
    id: 'map-fragment',
    name: 'Фрагмент карты',
    description: 'Часть карты с отмеченными местами. Может открыть новые локации.',
    category: 'misc',
    rarity: 4,
    weight: 0.1,
    usable: true,
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
    return {
      locationInventories: {
        ...state.locationInventories,
        [locationId]: [...currentInventory, item]
      }
    };
  }),
  
  removeItemFromLocation: (locationId, itemId) => set((state) => {
    const currentInventory = state.locationInventories[locationId] || [];
    return {
      locationInventories: {
        ...state.locationInventories,
        [locationId]: currentInventory.filter(item => item.id !== itemId)
      }
    };
  }),
  
  moveItemToPlayer: (locationId, itemId) => {
    const { removeItemFromLocation } = get();
    
    // We'll need to integrate with playerStore later
    // For now just remove it from location
    removeItemFromLocation(locationId, itemId);
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
          // Add variation to condition if applicable
          if (item.condition !== undefined) {
            const conditionVariance = Math.floor(Math.random() * 30) - 15; // +/- 15%
            const newItem = { 
              ...item, 
              condition: Math.max(5, Math.min(100, item.condition + conditionVariance))
            };
            foundItems.push(newItem);
            addItemToLocation(locationId, newItem.id);
          } else {
            foundItems.push(item);
            addItemToLocation(locationId, itemId);
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
