import { useState, useEffect } from 'react';
import { useTimeStore } from '../store/timeStore';
import { usePlayerStore } from '../store/playerStore';
import { useLootStore, LootItem } from '../store/lootStore';
import '../styles/LocationView.css';

interface LocationViewProps {
  location: {
    id: string;
    name: string;
    description: string;
    type: string;
  };
  onOpenMap: () => void;
  onOpenInventory: () => void;
  isInShelter: boolean;
}

const LocationView = ({ location, onOpenMap, onOpenInventory, isInShelter }: LocationViewProps) => {
  const { advanceTime } = useTimeStore();
  const addItem = usePlayerStore((state) => state.addItem);
  const { locationInventories, generateLoot, removeItemFromLocation } = useLootStore();
  
  const [showLoot, setShowLoot] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);
  const [searchedRecently, setSearchedRecently] = useState(false);
  
  // Get location's loot
  const locationLoot = locationInventories[location.id] || [];
  
  // Reset search cooldown when changing locations
  useEffect(() => {
    setSearchedRecently(false);
    setShowLoot(false);
    setSelectedItem(null);
  }, [location.id]);
  
  // Handle search action
  const handleSearch = () => {
    // Advance time when searching
    advanceTime(30); // 30 minutes
    
    // User's search efficiency (could be based on skills in the future)
    const searchEfficiency = 1.0;
    
    // Generate loot for this location
    const foundItems = generateLoot(location.id, location.type, searchEfficiency);
    
    // Set search cooldown
    setSearchedRecently(true);
    setTimeout(() => {
      setSearchedRecently(false);
    }, 60000); // Can search again after 1 minute (real time)
    
    // Show found items
    setShowLoot(true);
  };
  
  const handleTakeItem = () => {
    if (selectedItem) {
      // Add to player inventory - here we're simplifying by just using the item ID
      addItem(selectedItem.id);
      
      // Remove from location inventory
      removeItemFromLocation(location.id, selectedItem.id);
      
      // Clear selection
      setSelectedItem(null);
      
      // If no more items, hide the loot container
      if (locationLoot.length <= 1) {
        setShowLoot(false);
      }
    }
  };
  
  const handleUseItem = () => {
    if (selectedItem && selectedItem.usable) {
      // In a real implementation, this would have different effects based on the item
      console.log(`Using item: ${selectedItem.name}`);
      
      // Remove from location after using
      removeItemFromLocation(location.id, selectedItem.id);
      
      // Clear selection
      setSelectedItem(null);
      
      // If no more items, hide the loot container
      if (locationLoot.length <= 1) {
        setShowLoot(false);
      }
    }
  };
  
  // Helper to get condition class
  const getConditionClass = (condition?: number) => {
    if (condition === undefined) return '';
    if (condition > 70) return 'condition-good';
    if (condition > 30) return 'condition-fair';
    return 'condition-poor';
  };
  
  // Helper to get icon for item
  const getItemIcon = (category: string): string => {
    switch (category) {
      case 'weapon': return '🔫';
      case 'medical': return '💊';
      case 'food': return '🍖';
      case 'ammo': return '🧨';
      case 'tool': return '🔧';
      case 'clothing': return '👕';
      case 'misc': default: return '📦';
    }
  };
  
  return (
    <div className="location-view">
      <div className="location-header">
        <h2>{location.name}</h2>
        <div className="location-description">{location.description}</div>
      </div>
      
      {/* Display found loot if any */}
      {showLoot && locationLoot.length > 0 && (
        <div className="found-loot-container">
          <div className="found-loot-header">
            <h3>Найденные предметы</h3>
          </div>
          
          <div className="found-items-list">
            {locationLoot.map((item) => (
              <div 
                key={item.id} 
                className={`found-item ${selectedItem?.id === item.id ? 'selected' : ''} ${getConditionClass(item.condition)}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="item-icon">{getItemIcon(item.category)}</div>
                <div className="item-name">{item.name}</div>
                {item.condition !== undefined && (
                  <div className="item-condition">
                    <div 
                      className="item-condition-value" 
                      style={{ width: `${item.condition}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedItem && (
            <div className="loot-actions">
              <button className="loot-action-button primary" onClick={handleTakeItem}>
                Взять
              </button>
              {selectedItem.usable && (
                <button className="loot-action-button" onClick={handleUseItem}>
                  Использовать
                </button>
              )}
              <button 
                className="loot-action-button"
                onClick={() => setSelectedItem(null)}
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Selected item details */}
      {selectedItem && (
        <div className="item-details-modal">
          <div className="item-details-header">
            <span>{selectedItem.name}</span>
            <button className="close-details" onClick={() => setSelectedItem(null)}>×</button>
          </div>
          
          <div className="item-details-description">{selectedItem.description}</div>
          
          <div className="item-details-stats">
            <div className="item-stat">
              <div className="stat-label">Категория:</div>
              <div className="stat-value">{getCategoryLabel(selectedItem.category)}</div>
            </div>
            <div className="item-stat">
              <div className="stat-label">Вес:</div>
              <div className="stat-value">{selectedItem.weight} кг</div>
            </div>
            {selectedItem.condition !== undefined && (
              <div className="item-stat">
                <div className="stat-label">Состояние:</div>
                <div className="stat-value">{selectedItem.condition}%</div>
              </div>
            )}
            <div className="item-stat">
              <div className="stat-label">Редкость:</div>
              <div className="stat-value">{'★'.repeat(selectedItem.rarity)}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="location-actions">
        <button 
          className="game-button"
          onClick={onOpenMap}
        >
          Открыть карту
        </button>
        
        {/* Кнопка инвентаря отображается только в убежище */}
        {isInShelter && (
          <button 
            className="game-button"
            onClick={onOpenInventory}
          >
            Открыть инвентарь
          </button>
        )}
        
        {/* Другие действия, специфичные для убежища */}
        {isInShelter && (
          <>
            <button 
              className="game-button"
              onClick={() => advanceTime(8 * 60)} // Rest for 8 hours
            >
              Отдохнуть (8 часов)
            </button>
            <button className="game-button">Починить снаряжение</button>
          </>
        )}
        
        {/* Search button */}
        <button 
          className="game-button"
          onClick={handleSearch}
          disabled={searchedRecently}
        >
          Осмотреться (30 мин)
        </button>
      </div>
    </div>
  );
};

// Helper to get human-readable category names
function getCategoryLabel(category: string): string {
  switch (category) {
    case 'weapon': return 'Оружие';
    case 'medical': return 'Медицина';
    case 'food': return 'Еда и вода';
    case 'ammo': return 'Боеприпасы';
    case 'tool': return 'Инструменты';
    case 'clothing': return 'Одежда';
    case 'misc': default: return 'Разное';
  }
}

export default LocationView;
