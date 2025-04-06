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
  // Основные локации
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
  
  // Военные объекты
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
    id: 'military-outpost',
    name: 'Военный пост',
    description: 'Небольшой военный аванпост. Меньше припасов, но и меньше опасностей.',
    x: 65,
    y: 58,
    type: 'military',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  },
  {
    id: 'underground-bunker',
    name: 'Подземный бункер',
    description: 'Секретное военное убежище. Хорошо сохранилось, но путь внутрь затруднён.',
    x: 75,
    y: 42,
    type: 'military',
    accessible: false,
    dangerLevel: 3,
    discovered: false
  },
  
  // Медицинские учреждения
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
    id: 'clinic',
    name: 'Клиника',
    description: 'Небольшая районная клиника. Меньше ресурсов, но и меньше опасностей.',
    x: 30,
    y: 65,
    type: 'hospital',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  },
  {
    id: 'pharmacy',
    name: 'Аптека',
    description: 'Разграбленная аптека. Остались некоторые препараты, которые другие не сочли ценными.',
    x: 38,
    y: 48,
    type: 'hospital',
    accessible: true,
    dangerLevel: 1,
    discovered: true
  },
  
  // Городские локации
  {
    id: 'supermarket',
    name: 'Супермаркет',
    description: 'Заброшенный супермаркет. Возможно, здесь остались консервы и другие продукты.',
    x: 55,
    y: 58,
    type: 'city',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  },
  {
    id: 'police-station',
    name: 'Полицейский участок',
    description: 'Бывший полицейский участок. Можно найти оружие и боеприпасы.',
    x: 60,
    y: 52,
    type: 'city',
    accessible: false,
    dangerLevel: 3,
    discovered: false
  },
  {
    id: 'apartment-block',
    name: 'Жилой квартал',
    description: 'Заброшенные многоэтажки. В квартирах можно найти разные бытовые предметы.',
    x: 68,
    y: 48,
    type: 'city',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  },
  {
    id: 'shopping-mall',
    name: 'Торговый центр',
    description: 'Большой торговый центр. Много помещений, которые стоит исследовать, но и много опасностей.',
    x: 72,
    y: 55,
    type: 'city',
    accessible: true,
    dangerLevel: 4,
    discovered: true
  },
  
  // Заправочные станции
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
  },
  {
    id: 'truck-stop',
    name: 'Стоянка грузовиков',
    description: 'Заправка для дальнобойщиков с магазином. Здесь может быть больше полезных вещей.',
    x: 48,
    y: 25,
    type: 'gas-station',
    accessible: false,
    dangerLevel: 3,
    discovered: false
  },
  
  // Лесные локации
  {
    id: 'deep-forest',
    name: 'Дремучий лес',
    description: 'Густой лес вдали от цивилизации. Можно найти растения и дичь для пропитания.',
    x: 25,
    y: 30,
    type: 'forest',
    accessible: true,
    dangerLevel: 3,
    discovered: true
  },
  {
    id: 'ranger-station',
    name: 'Станция лесников',
    description: 'Небольшая станция наблюдения лесников. Здесь есть карты местности и немного припасов.',
    x: 32,
    y: 22,
    type: 'forest',
    accessible: false,
    dangerLevel: 1,
    discovered: false
  },
  {
    id: 'hunting-lodge',
    name: 'Охотничья хижина',
    description: 'Уединенное место, где охотники готовились к охоте. Можно найти оружие и снаряжение.',
    x: 20,
    y: 40,
    type: 'forest',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  },
  {
    id: 'abandoned-village',
    name: 'Заброшенная деревня',
    description: 'Небольшая деревня, жители которой исчезли. В домах можно найти различные вещи.',
    x: 15,
    y: 50,
    type: 'ruins',
    accessible: true,
    dangerLevel: 2,
    discovered: false
  },
  
  // Руины
  {
    id: 'old-factory',
    name: 'Старая фабрика',
    description: 'Заброшенная фабрика. Много металлолома и иногда запчасти.',
    x: 45,
    y: 68,
    type: 'ruins',
    accessible: true,
    dangerLevel: 3,
    discovered: true
  },
  {
    id: 'collapsed-bridge',
    name: 'Разрушенный мост',
    description: 'Когда-то это был важный транспортный узел. В обломках можно найти остатки транспортных средств.',
    x: 38,
    y: 75,
    type: 'ruins',
    accessible: false,
    dangerLevel: 2,
    discovered: false
  },
  {
    id: 'train-station',
    name: 'Железнодорожная станция',
    description: 'Заброшенная станция с несколькими вагонами. Возможно, в них остались полезные вещи.',
    x: 60,
    y: 70,
    type: 'ruins',
    accessible: true,
    dangerLevel: 2,
    discovered: true
  },
  
  // Новые типы локаций
  {
    id: 'radio-tower',
    name: 'Радиовышка',
    description: 'Высокая радиовышка с техническими помещениями. Может быть полезна для связи.',
    x: 80,
    y: 30,
    type: 'military',
    accessible: false,
    dangerLevel: 1,
    discovered: false
  },
  {
    id: 'underground-lab',
    name: 'Подземная лаборатория',
    description: 'Секретная исследовательская лаборатория. Что именно там изучали — неизвестно.',
    x: 85,
    y: 75,
    type: 'military',
    accessible: false,
    dangerLevel: 5,
    discovered: false
  },
  {
    id: 'water-treatment',
    name: 'Очистные сооружения',
    description: 'Станция для очистки воды. Здесь можно найти химикаты и некоторое оборудование.',
    x: 25,
    y: 65,
    type: 'ruins',
    accessible: false,
    dangerLevel: 2,
    discovered: false
  },
  {
    id: 'power-plant',
    name: 'Электростанция',
    description: 'Заброшенная электростанция. Если ее запустить, можно получить электроэнергию.',
    x: 15,
    y: 70,
    type: 'ruins',
    accessible: false,
    dangerLevel: 4,
    discovered: false
  },
  
  // Специальные локации
  {
    id: 'survivor-camp',
    name: 'Лагерь выживших',
    description: 'Небольшое поселение выживших. Здесь можно торговать и получать задания.',
    x: 40,
    y: 15,
    type: 'city',
    accessible: false,
    dangerLevel: 0,
    discovered: false
  },
  {
    id: 'bandit-hideout',
    name: 'Убежище бандитов',
    description: 'Опасное место, где обосновалась группа бандитов. Лучше избегать это место.',
    x: 78,
    y: 20,
    type: 'ruins',
    accessible: false,
    dangerLevel: 5,
    discovered: false
  },
  {
    id: 'crashed-plane',
    name: 'Разбившийся самолет',
    description: 'Обломки пассажирского самолета. Возможно, здесь есть что-то ценное.',
    x: 12,
    y: 30,
    type: 'ruins',
    accessible: true,
    dangerLevel: 3,
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