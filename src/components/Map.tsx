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
  dangerLevel: number; // от 0 до 5
  discovered: boolean;
}

interface MapProps {
  locations: Location[];
  currentLocation: string;
  onLocationSelect: (locationId: string) => void;
}

const Map = ({ locations, currentLocation, onLocationSelect }: MapProps) => {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const { dayPhase } = useTimeStore();
  
  // Get current location object
  const currentLocationObj = locations.find(loc => loc.id === currentLocation);
  
  // Filter out only discovered locations for routes
  const discoveredLocations = locations.filter(loc => loc.discovered);
  
  // Create smart routes - connect to nearby locations but avoid too many connections
  const createRoutes = () => {
    const routes: { from: Location, to: Location }[] = [];
    const maxDistance = 25; // Maximum distance for a direct connection
    
    discoveredLocations.forEach(loc1 => {
      // Find closest 2-3 locations to connect to
      const nearbyLocations = discoveredLocations
        .filter(loc2 => loc1.id !== loc2.id)
        .map(loc2 => ({
          location: loc2,
          distance: Math.sqrt(
            Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2)
          )
        }))
        .filter(item => item.distance < maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3); // Connect to at most 3 closest locations
      
      nearbyLocations.forEach(({ location: loc2 }) => {
        // Check if this route already exists (in either direction)
        const routeExists = routes.some(
          route => (route.from.id === loc1.id && route.to.id === loc2.id) || 
                  (route.from.id === loc2.id && route.to.id === loc1.id)
        );
        
        if (!routeExists) {
          routes.push({ from: loc1, to: loc2 });
        }
      });
    });
    
    return routes;
  };
  
  const routes = createRoutes();

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
          {routes.map((route, index) => (
            <line 
              key={`route-${index}`}
              x1={`${route.from.x}%`}
              y1={`${route.from.y}%`}
              x2={`${route.to.x}%`}
              y2={`${route.to.y}%`}
              className={`route-path ${
                (route.from.id === currentLocation || route.to.id === currentLocation) 
                  ? 'route-active' 
                  : ''
              }`}
            />
          ))}
        </svg>
      </div>
      
      {/* Location tooltip */}
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
              <p className="distance-text">
                {currentLocationObj && getDistanceText(hoveredLocation, currentLocationObj)}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Map legend */}
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
          <span>Военный объект</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon hospital"></div>
          <span>Медпункт</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon gas-station"></div>
          <span>Заправка</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate and format distance
function getDistanceText(loc1: Location, loc2: Location): string {
  const distance = Math.sqrt(
    Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2)
  );
  
  const approxKm = Math.round(distance * 0.5); // Convert to approximate kilometers
  return `Расстояние: ~${approxKm} км`;
}

export default Map;