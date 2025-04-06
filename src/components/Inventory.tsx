import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLootStore } from '../store/lootStore';
import QuantitySelector from './QuantitySelector';
import '../styles/Inventory.css';

interface InventoryProps {
  onClose: () => void;
}

type InventoryTab = 'all' | 'weapons' | 'consumables' | 'equipment';

const Inventory = ({ onClose }: InventoryProps) => {
  const inventory = usePlayerStore((state) => state.inventory);
  const removeItem = usePlayerStore((state) => state.removeItem);
  const items = useLootStore((state) => state.items);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InventoryTab>('all');
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantitySelectorAction, setQuantitySelectorAction] = useState<'use' | 'drop'>('use');

  const { 
    eat, 
    drink 
  } = usePlayerStore();

  // Get the selected item details
  const selectedInventoryItem = inventory.find(item => item.id === selectedItemId);
  const selectedItem = selectedInventoryItem ? items[selectedInventoryItem.id] : null;
  
  // Get all player items with their details and quantities
  const playerItems = inventory
    .map(invItem => {
      const itemDetails = items[invItem.id];
      if (!itemDetails) return null;
      
      return {
        ...itemDetails,
        quantity: invItem.quantity || 1
      };
    })
    .filter(Boolean) as (typeof items[string] & { quantity: number })[];

  // Group items by category
  const groupedItems: Record<string, (typeof items[string] & { quantity: number })[]> = {};
  
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
    if (selectedItemId && selectedItem?.usable) {
      const inventoryItem = inventory.find(item => item.id === selectedItemId);
      if (inventoryItem && inventoryItem.quantity && inventoryItem.quantity > 1) {
        // Show quantity selector for multiple items
        setQuantitySelectorAction('use');
        setShowQuantitySelector(true);
      } else {
        // Use single item directly
        consumeItem(selectedItemId, 1);
        setSelectedItemId(null);
      }
    }
  };

  // New function to handle consuming items
  const consumeItem = (itemId: string, quantity: number) => {
    const item = items[itemId];
    if (!item) return;
    
    // Apply effect based on item type
    switch(itemId) {
      // Food items
      case 'canned-meat':
        eat(30 * quantity);
        break;
      case 'dried-fruits':
        eat(20 * quantity);
        break;
      // Water items
      case 'water':
        drink(40 * quantity);
        break;
      // Medical items
      case 'medkit':
        usePlayerStore.getState().takeDamage(-40 * quantity); // Heal
        break;
      case 'bandage':
        usePlayerStore.getState().takeDamage(-15 * quantity); // Heal
        break;
      case 'antibiotics':
        usePlayerStore.getState().takeDamage(-10 * quantity); // Heal and reduce radiation
        const radiation = usePlayerStore.getState().radiation;
        if (radiation > 0) {
          // Reduce radiation by 20%
          usePlayerStore.setState({ radiation: Math.max(0, radiation - 20 * quantity) });
        }
        break;
      default:
        console.log(`Using item: ${item.name}`);
    }
    
    // Remove consumed items from inventory
    removeItem(itemId, quantity);
  };
  
  const handleDropItem = () => {
    if (selectedItemId) {
      const inventoryItem = inventory.find(item => item.id === selectedItemId);
      if (inventoryItem && inventoryItem.quantity && inventoryItem.quantity > 1) {
        // Show quantity selector for multiple items
        setQuantitySelectorAction('drop');
        setShowQuantitySelector(true);
      } else {
        // Drop single item directly
        removeItem(selectedItemId, 1);
        setSelectedItemId(null);
      }
    }
  };
  
  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedItemId) return;
    
    // Perform the action with the selected quantity
    if (quantitySelectorAction === 'use') {
      consumeItem(selectedItemId, quantity);
    } else if (quantitySelectorAction === 'drop') {
      removeItem(selectedItemId, quantity);
    }
    
    // Close the selector and clear selection
    setShowQuantitySelector(false);
    setSelectedItemId(null);
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
                      {items.map((item) => (
                        <div key={item.id} className="item-slot">
                          <div 
                            className={`inventory-item ${selectedItemId === item.id ? 'selected' : ''}`}
                            onClick={() => setSelectedItemId(item.id)}
                          >
                            <div className="item-icon">{getItemIcon(item.category)}</div>
                            <div className="item-name">{item.name}</div>
                            
                            {/* Show quantity for stacked items */}
                            {item.quantity > 1 && (
                              <div className="item-quantity">{item.quantity}</div>
                            )}
                            
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
                          </div>
                        </div>
                      ))}
                      
                      {/* Add empty slots to fill the row */}
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
        
        {selectedItemId && selectedItem && (
          <div className="item-details">
            <div className="item-details-icon">
              {getItemIcon(selectedItem.category)}
            </div>
            
            <div className="item-details-content">
              <h3>
                {selectedItem.name}
                {selectedInventoryItem?.quantity && selectedInventoryItem.quantity > 1 && (
                  <span className="quantity-badge"> x{selectedInventoryItem.quantity}</span>
                )}
              </h3>
              <div className="item-description">{selectedItem.description}</div>
              
              <div className="item-stats">
                <div className="item-stat">
                  <span className="stat-label">Категория</span>
                  <span className="stat-value">{getCategoryName(selectedItem.category)}</span>
                </div>
                
                <div className="item-stat">
                  <span className="stat-label">Вес</span>
                  <span className="stat-value">
                    {selectedInventoryItem?.quantity && selectedInventoryItem.quantity > 1 
                      ? `${selectedItem.weight * selectedInventoryItem.quantity} кг (${selectedItem.weight} x ${selectedInventoryItem.quantity})`
                      : `${selectedItem.weight} кг`}
                  </span>
                </div>
                
                {selectedItem.condition !== undefined && (
                  <div className="item-stat">
                    <span className="stat-label">Состояние</span>
                    <span className="stat-value">{selectedItem.condition}%</span>
                  </div>
                )}
                
                <div className="item-stat">
                  <span className="stat-label">Редкость</span>
                  <span className="stat-value">{'★'.repeat(selectedItem.rarity)}</span>
                </div>
              </div>
              
              <div className="item-actions">
                {selectedItem.usable && (
                  <button className="item-action-button use-button" onClick={handleUseItem}>
                    Использовать {selectedInventoryItem?.quantity && selectedInventoryItem.quantity > 1 ? '...' : ''}
                  </button>
                )}
                <button className="item-action-button drop-button" onClick={handleDropItem}>
                  Выбросить {selectedInventoryItem?.quantity && selectedInventoryItem.quantity > 1 ? '...' : ''}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quantity Selector */}
        {showQuantitySelector && selectedItemId && selectedItem && selectedInventoryItem && (
          <QuantitySelector 
            maxQuantity={selectedInventoryItem.quantity || 1}
            onConfirm={handleQuantityConfirm}
            onCancel={() => setShowQuantitySelector(false)}
            itemName={selectedItem.name}
            action={quantitySelectorAction}
          />
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
