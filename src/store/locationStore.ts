import { create } from 'zustand';
import { Location } from '../components/Map';

interface LocationState {
  locations: Location[];
  currentLocationId: string;
  discoverLocation: (locationId: string) => void;
  setCurrentLocation: (locationId: string) => void;
  makeLocationAccessible: (locationId: string) => void;
}

// Начальные данные о локациях
const initialLocations: Location[] = [
  {
    id: 'home',
    name: 'Убежище',
    description: 'Ваше временное убежище. Здесь вы можете отдохнуть и восстановить здоровье.',
    x: 50,
    y: 50,
    type: 'ruins',
    accessible: true,
    dangerLevel: 0,
    discovered: true
  },
  {
    id: 'abandoned-city',
    name: 'Заброшенный город',
    description: 'Руины некогда процветающего города. Здесь можно найти припасы, но опасно из-за мутантов.',
    x: 62,
    y: 45,
    type: 'city',
    accessible: true,
    dangerLevel: 3,
    discovered: true
  },
  {
    id: 'forest-camp',
    name: 'Лесной лагерь',
    description: 'Заброшенный лагерь в лесу. Относительно безопасное место для ночлега.',
    x: 40,
    y: 38,
    type: 'forest',
    accessible: true,
    dangerLevel: 1,
    discovered: true
  },
  {
    id: 'military-base',
    name: 'Военная база',
    description: 'Хорошо укрепленная военная база. Здесь можно найти оружие и медикаменты.',
    x: 70,
    y: 65,
    type: 'military',
    accessible: false,
    dangerLevel: 4,
    discovered: false
  },
  {
    id: 'hospital',
    name: 'Госпиталь',
    description: 'Заброшенный госпиталь. Много медикаментов, но и много зараженных.',
    x: 35,
    y: 60,
    type: 'hospital',
    accessible: false,
    dangerLevel: 5,
    discovered: true
  },
  {
    id: 'gas-station',
    name: 'Заправочная станция',
    description: 'Старая заправка. Можно найти топливо и запчасти.',
    x: 55,
    y: 30,
    type: 'gas-station',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  }
];

export const useLocationStore = create<LocationState>((set) => ({
  locations: initialLocations,
  currentLocationId: 'home',
  
  discoverLocation: (locationId) => set((state) => ({
    locations: state.locations.map(location => 
      location.id === locationId 
        ? { ...location, discovered: true }
        : location
    )
  })),
  
  setCurrentLocation: (locationId) => set({
    currentLocationId: locationId
  }),
  
  makeLocationAccessible: (locationId) => set((state) => ({
    locations: state.locations.map(location => 
      location.id === locationId 
        ? { ...location, accessible: true }
        : location
    )
  }))
}));