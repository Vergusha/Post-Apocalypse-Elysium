import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLocationStore } from '../store/locationStore';
import Map from '../components/Map';
import Inventory from '../components/Inventory';
import '../styles/GameScreen.css';

const GameScreen = () => {
  const player = usePlayerStore();
  const { locations, currentLocationId, setCurrentLocation } = useLocationStore();
  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  const currentLocation = locations.find(loc => loc.id === currentLocationId);
  const isInShelter = currentLocationId === 'home';

  const handleLocationSelect = (locationId: string) => {
    setCurrentLocation(locationId);
    // Здесь можно добавить логику перемещения (затраты энергии, времени и т.д.)
    setShowMap(false);
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
                  <button className="game-button">Отдохнуть</button>
                  <button className="game-button">Починить снаряжение</button>
                </>
              )}
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
