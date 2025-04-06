import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLootStore, LootItem } from '../store/lootStore';
import QuantitySelector from './QuantitySelector';
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
  onAdvanceTime: (minutes: number) => void; // Add this prop
}

const LocationView = ({ 
  location, 
  onOpenMap, 
  onOpenInventory, 
  isInShelter,
  onAdvanceTime
}: LocationViewProps) => {
  const { locationInventories, generateLoot, removeItemFromLocation, moveItemToPlayer } = useLootStore();
  
  const [showLoot, setShowLoot] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantitySelectorAction, setQuantitySelectorAction] = useState<'take' | 'use' | 'drop'>('take');
  
  // Get location's loot
  const locationLoot = locationInventories[location.id] || [];
  
  // Reset selections when changing locations
  useEffect(() => {
    setShowLoot(false);
    setSelectedItem(null);
  }, [location.id]);
  
  // Handle search action
  const handleSearch = () => {
    onAdvanceTime(30); // Use the prop instead of directly accessing advanceTime
    const searchEfficiency = 1.0;
    const foundItems = generateLoot(location.id, location.type, searchEfficiency);
    
    setShowLoot(true);
  };
  
  // Handle taking all items at once
  const handleTakeAll = () => {
    if (locationLoot.length === 0) return;
    
    // Move each item to the player's inventory
    locationLoot.forEach(item => {
      moveItemToPlayer(location.id, item.id, item.quantity || 1);
    });
    
    // Hide the loot container since all items have been taken
    setShowLoot(false);
    setSelectedItem(null);
  };

  const handleTakeItem = () => {
    if (selectedItem) {
      if (selectedItem.stackable && (selectedItem.quantity || 1) > 1) {
        // Show quantity selector for stackable items
        setQuantitySelectorAction('take');
        setShowQuantitySelector(true);
      } else {
        // Take single item directly
        moveItemToPlayer(location.id, selectedItem.id, 1);
        setSelectedItem(null);
        
        if (locationLoot.length <= 1) {
          setShowLoot(false);
        }
      }
    }
  };
  
  const handleUseItem = () => {
    if (selectedItem && selectedItem.usable) {
      if (selectedItem.stackable && (selectedItem.quantity || 1) > 1) {
        // Show quantity selector for stackable items
        setQuantitySelectorAction('use');
        setShowQuantitySelector(true);
      } else {
        // Use single item directly
        removeItemFromLocation(location.id, selectedItem.id);
        setSelectedItem(null);
        
        if (locationLoot.length <= 1) {
          setShowLoot(false);
        }
      }
    }
  };
  
  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedItem) return;
    
    switch (quantitySelectorAction) {
      case 'take':
        moveItemToPlayer(location.id, selectedItem.id, quantity);
        break;
      case 'use':
        // Use multiple items
        removeItemFromLocation(location.id, selectedItem.id, quantity);
        break;
      case 'drop':
        // Not applicable in this component, but included for future use
        break;
    }
    
    setShowQuantitySelector(false);
    setSelectedItem(null);
    
    // Check if we need to hide the loot container
    if (locationLoot.length <= 1) {
      setShowLoot(false);
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
            {/* Add Take All button */}
            <button 
              className="loot-action-button primary take-all-button"
              onClick={handleTakeAll}
            >
              Забрать все
            </button>
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
                
                {/* Show quantity for stackable items */}
                {item.stackable && item.quantity && item.quantity > 1 && (
                  <div className="item-quantity">{item.quantity}</div>
                )}
                
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
                Взять {selectedItem.stackable && (selectedItem.quantity || 0) > 1 ? "..." : ""}
              </button>
              {selectedItem.usable && (
                <button className="loot-action-button" onClick={handleUseItem}>
                  Использовать {selectedItem.stackable && (selectedItem.quantity || 0) > 1 ? "..." : ""}
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
            {selectedItem.stackable && selectedItem.quantity && selectedItem.quantity > 1 && (
              <span className="item-quantity-badge">x{selectedItem.quantity}</span>
            )}
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
              <div className="stat-value">
                {selectedItem.stackable && selectedItem.quantity ? 
                  `${selectedItem.weight * selectedItem.quantity} кг (${selectedItem.weight} x ${selectedItem.quantity})` : 
                  `${selectedItem.weight} кг`}
              </div>
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
              onClick={() => onAdvanceTime(8 * 60)} // Use the prop for advancing time
            >
              Отдохнуть (8 часов)
            </button>
            <button className="game-button">Починить снаряжение</button>
          </>
        )}
        
        {/* Search button - now always available */}
        <button 
          className="game-button"
          onClick={handleSearch}
        >
          Осмотреться (30 мин)
        </button>
      </div>
      
      {/* Quantity Selector */}
      {showQuantitySelector && selectedItem && (
        <QuantitySelector 
          maxQuantity={selectedItem.quantity || 1}
          onConfirm={handleQuantityConfirm}
          onCancel={() => setShowQuantitySelector(false)}
          itemName={selectedItem.name}
          action={quantitySelectorAction}
        />
      )}
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
