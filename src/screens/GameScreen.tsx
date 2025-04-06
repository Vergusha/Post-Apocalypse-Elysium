import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLocationStore } from '../store/locationStore';
import { useTimeStore, formatTime, formatDayTime } from '../store/timeStore';
import Map from '../components/Map';
import Inventory from '../components/Inventory';
import '../styles/GameScreen.css';

const GameScreen = () => {
  const player = usePlayerStore();
  const { locations, currentLocationId, setCurrentLocation } = useLocationStore();
  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  // Time state from the time store
  const { day, hour, minute, dayPhase, advanceTime, paused, togglePause } = useTimeStore();
  
  const currentLocation = locations.find(loc => loc.id === currentLocationId);
  const isInShelter = currentLocationId === 'home';

  // Real-time clock that advances game time
  useEffect(() => {
    const gameTimeInterval = setInterval(() => {
      if (!paused) {
        // Advance 10 minutes every real-time minute (adjust as needed)
        advanceTime(1);
      }
    }, 6000); // 6 seconds = 1 game minute (real time)
    
    return () => clearInterval(gameTimeInterval);
  }, [paused, advanceTime]);

  const handleLocationSelect = (locationId: string) => {
    // Time cost for travel between locations (example implementation)
    const startLoc = locations.find(loc => loc.id === currentLocationId);
    const endLoc = locations.find(loc => loc.id === locationId);
    
    if (startLoc && endLoc) {
      // Calculate distance (simple Euclidean distance)
      const distance = Math.sqrt(
        Math.pow(startLoc.x - endLoc.x, 2) + Math.pow(startLoc.y - endLoc.y, 2)
      );
      
      // Convert distance to time (minutes)
      const travelTime = Math.round(distance * 5); // 5 minutes per distance unit
      
      // Advance game time
      advanceTime(travelTime);
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
  
  return (
    <div className="game-screen">
      {/* Верхняя панель с характеристиками игрока */}
      <div className="top-stats-bar">
        <div className="player-name">{player.name}</div>
        <div className="stats-container">
          <div className="stat-bar">
            <div className="stat-label">
              <span>Здоровье:</span>
              <span>{player.health}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value health" 
                style={{ width: `${player.health}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-bar">
            <div className="stat-label">
              <span>Голод:</span>
              <span>{player.hunger}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value hunger" 
                style={{ width: `${player.hunger}%` }}
              ></div>
            </div>
          </div>
          
          <div className="stat-bar">
            <div className="stat-label">
              <span>Радиация:</span>
              <span>{player.radiation}%</span>
            </div>
            <div className="stat-value-wrapper">
              <div 
                className="stat-value radiation" 
                style={{ width: `${player.radiation}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Time display */}
        <div className="time-display" onClick={togglePause}>
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
          <div className="location-view">
            <h2>{currentLocation?.name}</h2>
            <p>{currentLocation?.description}</p>
            
            <div className="location-actions">
              <button 
                className="game-button"
                onClick={() => setShowMap(true)}
              >
                Открыть карту
              </button>
              
              {/* Кнопка инвентаря отображается только в убежище */}
              {isInShelter && (
                <button 
                  className="game-button"
                  onClick={() => setShowInventory(true)}
                >
                  Открыть инвентарь
                </button>
              )}
              
              {/* Другие действия, специфичные для убежища */}
              {isInShelter && (
                <>
                  <button 
                    className="game-button"
                    onClick={() => {
                      // Rest for 8 hours
                      advanceTime(8 * 60); 
                      // In the future, this would also restore health, reduce hunger, etc.
                    }}
                  >
                    Отдохнуть (8 часов)
                  </button>
                  <button className="game-button">Починить снаряжение</button>
                </>
              )}
              
              {/* Example of an action that takes time */}
              <button 
                className="game-button"
                onClick={() => advanceTime(30)} // Takes 30 minutes
              >
                Осмотреться (30 мин)
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Модальное окно инвентаря */}
      {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
    </div>
  );
};

export default GameScreen;
