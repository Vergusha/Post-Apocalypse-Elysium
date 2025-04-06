import { useState, useEffect } from 'react';
import { usePlayerStore, SURVIVAL_RATES } from '../store/playerStore';
import { useLocationStore } from '../store/locationStore';
import { useTimeStore, formatTime, formatDayTime } from '../store/timeStore';
import Map from '../components/Map';
import Inventory from '../components/Inventory';
import LocationView from '../components/LocationView';
import '../styles/GameScreen.css';

const GameScreen = () => {
  const { 
    health, 
    hunger, 
    thirst, 
    radiation, 
    increaseHunger, 
    increaseThirst, 
    takeDamage 
  } = usePlayerStore();
  const { locations, currentLocationId, setCurrentLocation } = useLocationStore();
  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  // Time state from the time store
  const { day, hour, minute, dayPhase, advanceTime, paused, togglePause } = useTimeStore();
  
  const currentLocation = locations.find(loc => loc.id === currentLocationId) || {
    id: 'unknown',
    name: 'Неизвестно',
    description: 'Вы потерялись...',
    type: 'ruins',
    accessible: true,
    dangerLevel: 0,
    discovered: true,
    x: 0,
    y: 0
  };
  
  const isInShelter = currentLocationId === 'home';

  // Handle real-time game updates
  useEffect(() => {
    const gameUpdateInterval = setInterval(() => {
      if (!paused) {
        // Apply hunger and thirst effects based on time
        increaseHunger(SURVIVAL_RATES.HUNGER_PER_MINUTE);
        increaseThirst(SURVIVAL_RATES.THIRST_PER_MINUTE);
        
        // Apply health damage if hunger or thirst are critical
        if (hunger > SURVIVAL_RATES.HEALTH_LOSS_THRESHOLD || 
            thirst > SURVIVAL_RATES.HEALTH_LOSS_THRESHOLD) {
          takeDamage(SURVIVAL_RATES.HEALTH_LOSS_RATE);
        }
      }
    }, 6000); // 6 seconds = 1 game minute
    
    return () => clearInterval(gameUpdateInterval);
  }, [paused, hunger, thirst, increaseHunger, increaseThirst, takeDamage]);

  // Handle location selection and travel costs
  const handleLocationSelect = (locationId: string) => {
    // Time cost for travel between locations
    const startLoc = locations.find(loc => loc.id === currentLocationId);
    const endLoc = locations.find(loc => loc.id === locationId);
    
    if (startLoc && endLoc) {
      // Calculate distance (simple Euclidean distance)
      const distance = Math.sqrt(
        Math.pow(startLoc.x - endLoc.x, 2) + Math.pow(startLoc.y - endLoc.y, 2)
      );
      
      // Convert distance to time and survival costs
      const travelTime = Math.round(distance * 5); // 5 minutes per distance unit
      const travelDistanceKm = distance * 0.5; // Approximate kilometers
      
      // Apply travel costs
      advanceTime(travelTime);
      increaseHunger(travelDistanceKm * SURVIVAL_RATES.HUNGER_PER_KM);
      increaseThirst(travelDistanceKm * SURVIVAL_RATES.THIRST_PER_KM);
    }
    
    setCurrentLocation(locationId);
    setShowMap(false);
  };
  
  // Get the visual description for the current time of day
  const getTimeOfDayDescription = () => {
    switch(dayPhase) {
      case 'morning': return 'Утро';
      case 'day': return 'День';
      case 'evening': return 'Вечер';
      case 'night': return 'Ночь';
    }
  };
  
  // Handle advancing time with survival costs
  const handleAdvanceTime = (minutes: number) => {
    advanceTime(minutes);
    
    // Apply survival costs for the time passed
    increaseHunger(minutes * SURVIVAL_RATES.HUNGER_PER_MINUTE);
    increaseThirst(minutes * SURVIVAL_RATES.THIRST_PER_MINUTE);
  };
  
  return (
    <div className="game-screen">
      {/* Верхняя панель с характеристиками игрока */}
      <div className="top-stats-bar">
        <div className="player-name">{usePlayerStore(state => state.name)}</div>
        <div className="stats-container">
          <div className="stat-bar">
            <div className="stat-label">
              <span>Здоровье:</span>
              <span>{health}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value health" 
                style={{ width: `${health}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-bar">
            <div className="stat-label">
              <span>Сытость:</span>
              <span>{100 - hunger}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value hunger" 
                style={{ width: `${100 - hunger}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-bar">
            <div className="stat-label">
              <span>Жажда:</span>
              <span>{100 - thirst}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value thirst" 
                style={{ width: `${100 - thirst}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-bar">
            <div className="stat-label">
              <span>Радиация:</span>
              <span>{radiation}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value radiation" 
                style={{ width: `${radiation}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Time display */}
        <div className="time-display" onClick={() => useTimeStore.getState().togglePause()}>
          <div className="time-icon">⏱️</div>
          <div className="time-text">
            <div className="time-value">{formatTime(hour, minute)}</div>
            <div className={`day-phase ${dayPhase}`}>
              День {day}, {getTimeOfDayDescription()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Основная игровая область */}
      <div className="game-area">
        {showMap ? (
          <div className="map-view">
            <Map 
              locations={locations}
              currentLocation={currentLocationId}
              onLocationSelect={handleLocationSelect}
            />
            <button 
              className="close-map-btn"
              onClick={() => setShowMap(false)}
            >
              Закрыть карту
            </button>
          </div>
        ) : (
          <LocationView 
            location={{
              id: currentLocation.id,
              name: currentLocation.name,
              description: currentLocation.description,
              type: currentLocation.type
            }}
            onOpenMap={() => setShowMap(true)}
            onOpenInventory={() => setShowInventory(true)}
            isInShelter={isInShelter}
            onAdvanceTime={handleAdvanceTime}
          />
        )}
      </div>
      
      {/* Модальное окно инвентаря */}
      {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
    </div>
  );
};

export default GameScreen;
