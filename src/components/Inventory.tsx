import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLootStore, LootItem } from '../store/lootStore';
import '../styles/Inventory.css';

interface InventoryProps {
  onClose: () => void;
}

type InventoryTab = 'all' | 'weapons' | 'consumables' | 'equipment';

const Inventory = ({ onClose }: InventoryProps) => {
  const inventory = usePlayerStore((state) => state.inventory);
  const removeItem = usePlayerStore((state) => state.removeItem);
  const items = useLootStore((state) => state.items);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InventoryTab>('all');

  // Get all player items with their details
  const playerItems = inventory
    .map(itemId => items[itemId])
    .filter(Boolean) as LootItem[];

  // Group items by category
  const groupedItems: Record<string, LootItem[]> = {};
  
  playerItems.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Filter categories based on active tab
  const filteredCategories = Object.entries(groupedItems).filter(([category]) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'weapons' && ['weapon', 'ammo'].includes(category)) return true;
    if (activeTab === 'consumables' && ['food', 'medical'].includes(category)) return true;
    if (activeTab === 'equipment' && ['clothing', 'tool', 'misc'].includes(category)) return true;
    return false;
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

  // Helper to get condition class
  const getConditionClass = (condition?: number) => {
    if (condition === undefined) return '';
    if (condition > 70) return 'condition-good';
    if (condition > 30) return 'condition-fair';
    return 'condition-poor';
  };

  return (
    <div className="inventory-overlay">
      <div className="inventory-container">
        <div className="inventory-header">
          <h2>Инвентарь</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Inventory tabs */}
        <div className="inventory-tabs">
          <button 
            className={`inventory-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Все
          </button>
          <button 
            className={`inventory-tab ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => setActiveTab('weapons')}
          >
            Оружие
          </button>
          <button 
            className={`inventory-tab ${activeTab === 'consumables' ? 'active' : ''}`}
            onClick={() => setActiveTab('consumables')}
          >
            Расходники
          </button>
          <button 
            className={`inventory-tab ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            Снаряжение
          </button>
        </div>
        
        <div className="inventory-content">
          {playerItems.length === 0 ? (
            <div className="empty-inventory">
              <p>Ваш инвентарь пуст.</p>
              <p>Исследуйте пустошь, чтобы найти предметы.</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {filteredCategories.length === 0 ? (
                <div className="empty-category">
                  Нет предметов в этой категории
                </div>
              ) : (
                filteredCategories.map(([category, items]) => (
                  <div key={category} className="item-category">
                    <div className="category-header">
                      <h3>{getCategoryName(category)}</h3>
                      <div className="category-count">{items.length} шт.</div>
                    </div>
                    
                    <div className="items-list">
                      {items.map((item) => {
                        // Group similar items (not implemented yet, just a placeholder)
                        const quantity = 1;
                        
                        return (
                          <div key={item.id} className="item-slot">
                            <div 
                              className={`inventory-item ${selectedItem === item.id ? 'selected' : ''}`}
                              onClick={() => setSelectedItem(item.id)}
                            >
                              <div className="item-icon">{getItemIcon(item.category)}</div>
                              <div className="item-name">{item.name}</div>
                              
                              {/* Item condition indicator */}
                              {item.condition !== undefined && (
                                <div className="item-condition-indicator">
                                  <div 
                                    className={`condition-value ${getConditionClass(item.condition)}`} 
                                    style={{ width: `${item.condition}%` }}
                                  ></div>
                                </div>
                              )}
                              
                              {/* Rarity stars */}
                              {item.rarity > 1 && (
                                <div className="item-rarity">
                                  {'★'.repeat(item.rarity - 1)}
                                </div>
                              )}
                              
                              {/* Quantity badge (for future use) */}
                              {quantity > 1 && (
                                <div className="item-quantity">{quantity}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add empty slots to fill the row - makes UI feel more like a traditional inventory */}
                      {[...Array(Math.max(0, 5 - items.length))].map((_, index) => (
                        <div key={`empty-${category}-${index}`} className="item-slot"></div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {selectedItem && items[selectedItem] && (
          <div className="item-details">
            <div className="item-details-icon">
              {getItemIcon(items[selectedItem].category)}
            </div>
            
            <div className="item-details-content">
              <h3>{items[selectedItem].name}</h3>
              <div className="item-description">{items[selectedItem].description}</div>
              
              <div className="item-stats">
                <div className="item-stat">
                  <span className="stat-label">Категория</span>
                  <span className="stat-value">{getCategoryName(items[selectedItem].category)}</span>
                </div>
                
                <div className="item-stat">
                  <span className="stat-label">Вес</span>
                  <span className="stat-value">{items[selectedItem].weight} кг</span>
                </div>
                
                {items[selectedItem].condition !== undefined && (
                  <div className="item-stat">
                    <span className="stat-label">Состояние</span>
                    <span className="stat-value">{items[selectedItem].condition}%</span>
                  </div>
                )}
                
                <div className="item-stat">
                  <span className="stat-label">Редкость</span>
                  <span className="stat-value">{'★'.repeat(items[selectedItem].rarity)}</span>
                </div>
              </div>
              
              <div className="item-actions">
                {items[selectedItem].usable && (
                  <button className="item-action-button use-button" onClick={handleUseItem}>
                    Использовать
                  </button>
                )}
                <button className="item-action-button drop-button" onClick={handleDropItem}>
                  Выбросить
                </button>
              </div>
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
    'food': 'Еда и вода',
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
