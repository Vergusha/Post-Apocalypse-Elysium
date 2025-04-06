import { useState } from 'react';
import { useTimeStore } from '../store/timeStore';
import '../styles/Map.css';

export interface Location {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  type: 'city' | 'ruins' | 'forest' | 'military' | 'hospital' | 'gas-station';
  accessible: boolean;
  dangerLevel: number; // от 1 до 5
  discovered: boolean;
}

interface MapProps {
  locations: Location[];
  currentLocation: string;
  onLocationSelect: (locationId: string) => void;
}

const Map = ({ locations, currentLocation, onLocationSelect }: MapProps) => {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const { dayPhase } = useTimeStore(); // Get the current day phase
  
  return (
    <div className={`map-container ${dayPhase}`}>
      <div className="map-background">
        {locations.map((location) => (
          <div 
            key={location.id}
            className={`location-marker ${location.type} ${
              location.discovered ? 'discovered' : 'undiscovered'
            } ${currentLocation === location.id ? 'current' : ''} 
              ${location.accessible ? 'accessible' : 'inaccessible'}`}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            onClick={() => location.accessible && onLocationSelect(location.id)}
            onMouseEnter={() => setHoveredLocation(location)}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            {location.discovered && (
              <div className="location-icon">
                {location.dangerLevel > 0 && (
                  <div className="danger-level">
                    {"!".repeat(location.dangerLevel)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Линии маршрутов между локациями */}
        <svg className="routes-overlay">
          {locations
            .filter(loc => loc.discovered)
            .flatMap(loc1 => 
              locations
                .filter(loc2 => loc2.discovered && loc1.id < loc2.id)
                .filter(loc2 => {
                  // Проверяем, что локации находятся достаточно близко друг к другу
                  const distance = Math.sqrt(
                    Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2)
                  );
                  return distance < 25; // Максимальное расстояние для соединения
                })
                .map(loc2 => (
                  <line 
                    key={`${loc1.id}-${loc2.id}`}
                    x1={`${loc1.x}%`}
                    y1={`${loc1.y}%`}
                    x2={`${loc2.x}%`}
                    y2={`${loc2.y}%`}
                    className="route-path"
                  />
                ))
            )
          }
        </svg>
      </div>
      
      {hoveredLocation && (
        <div className="location-tooltip" 
          style={{ 
            left: `${hoveredLocation.x > 70 ? hoveredLocation.x - 20 : hoveredLocation.x + 5}%`, 
            top: `${hoveredLocation.y > 70 ? hoveredLocation.y - 15 : hoveredLocation.y + 5}%` 
          }}>
          <h3>{hoveredLocation.name}</h3>
          {hoveredLocation.discovered && (
            <div className="location-description">
              <p>{hoveredLocation.description}</p>
              {hoveredLocation.dangerLevel > 0 && (
                <p className="danger-text">Уровень опасности: {hoveredLocation.dangerLevel}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="map-legend">
        <h3>Легенда</h3>
        <div className="legend-item">
          <div className="legend-icon city"></div>
          <span>Город</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon ruins"></div>
          <span>Руины</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon forest"></div>
          <span>Лес</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon military"></div>
          <span>Военная база</span>
        </div>
      </div>
    </div>
  );
};

export default Map;