import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLootStore } from '../store/lootStore';
import '../styles/Inventory.css';

interface InventoryProps {
  onClose: () => void;
}

const Inventory = ({ onClose }: InventoryProps) => {
  const inventory = usePlayerStore((state) => state.inventory);
  const removeItem = usePlayerStore((state) => state.removeItem);
  const items = useLootStore((state) => state.items);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Group items by type for better organization
  const groupedItems: Record<string, string[]> = {};
  
  inventory.forEach(itemId => {
    if (items[itemId]) {
      const category = items[itemId].category;
      
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(itemId);
    }
  });

  const handleUseItem = () => {
    if (selectedItem) {
      const item = items[selectedItem];
      if (item && item.usable) {
        console.log(`Using item: ${item.name}`);
        // In the future, implement actual item use effects here
        removeItem(selectedItem);
        setSelectedItem(null);
      }
    }
  };

  const handleDropItem = () => {
    if (selectedItem) {
      removeItem(selectedItem);
      setSelectedItem(null);
    }
  };

  return (
    <div className="inventory-overlay">
      <div className="inventory-container">
        <div className="inventory-header">
          <h2>Инвентарь</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="inventory-content">
          {inventory.length === 0 ? (
            <div className="empty-inventory">
              <p>Ваш инвентарь пуст.</p>
              <p>Исследуйте пустошь, чтобы найти предметы.</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {Object.entries(groupedItems).map(([category, itemIds]) => (
                <div key={category} className="item-category">
                  <h3>{getCategoryName(category)}</h3>
                  <div className="items-list">
                    {itemIds.map((itemId) => {
                      const item = items[itemId];
                      if (!item) return null;
                      
                      return (
                        <div 
                          key={itemId}
                          className={`inventory-item ${selectedItem === itemId ? 'selected' : ''}`}
                          onClick={() => setSelectedItem(itemId)}
                        >
                          <div className="item-icon">
                            {getItemIcon(item.category)}
                          </div>
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
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedItem && items[selectedItem] && (
          <div className="item-details">
            <h3>{items[selectedItem].name}</h3>
            <p>{items[selectedItem].description}</p>
            <div className="item-actions">
              {items[selectedItem].usable && (
                <button className="item-action-button" onClick={handleUseItem}>
                  Использовать
                </button>
              )}
              <button className="item-action-button" onClick={handleDropItem}>
                Выбросить
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for displaying item information
function getCategoryName(category: string): string {
  const categories: Record<string, string> = {
    'weapon': 'Оружие',
    'food': 'Еда',
    'medical': 'Медикаменты',
    'ammo': 'Боеприпасы',
    'misc': 'Разное',
    'clothing': 'Одежда',
    'tool': 'Инструменты'
  };
  
  return categories[category] || 'Разное';
}

function getItemIcon(category: string): string {
  const icons: Record<string, string> = {
    'weapon': '🔫',
    'food': '🍖',
    'medical': '💊',
    'ammo': '🧨',
    'misc': '📦',
    'clothing': '👕',
    'tool': '🔧'
  };
  
  return icons[category] || '📦';
}

export default Inventory;
