import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import '../styles/Inventory.css';

interface InventoryProps {
  onClose: () => void;
}

const Inventory = ({ onClose }: InventoryProps) => {
  const inventory = usePlayerStore((state) => state.inventory);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Group items by type for better organization
  const groupedItems: Record<string, string[]> = {};
  
  inventory.forEach(item => {
    // Extract item category from item string (assuming format like "weapon:pistol")
    const category = item.includes(':') ? item.split(':')[0] : 'misc';
    
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });

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
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="item-category">
                  <h3>{getCategoryName(category)}</h3>
                  <div className="items-list">
                    {items.map((item, index) => {
                      const itemName = item.includes(':') ? item.split(':')[1] : item;
                      return (
                        <div 
                          key={`${item}-${index}`}
                          className={`inventory-item ${selectedItem === item ? 'selected' : ''}`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="item-icon">
                            {getItemIcon(item)}
                          </div>
                          <div className="item-name">{formatItemName(itemName)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedItem && (
          <div className="item-details">
            <h3>{formatItemName(selectedItem.includes(':') ? selectedItem.split(':')[1] : selectedItem)}</h3>
            <p>{getItemDescription(selectedItem)}</p>
            <div className="item-actions">
              <button className="item-action-button">Использовать</button>
              <button className="item-action-button">Выбросить</button>
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

function getItemIcon(item: string): string {
  // Simple icon representation - this could be replaced with actual icon components
  const category = item.includes(':') ? item.split(':')[0] : 'misc';
  
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

function formatItemName(name: string): string {
  // Convert kebab-case to normal text
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getItemDescription(item: string): string {
  // This would ideally come from a database or store of item details
  const descriptions: Record<string, string> = {
    'weapon:pistol': 'Стандартный пистолет. Надежен и прост в использовании.',
    'weapon:rifle': 'Винтовка с оптическим прицелом. Эффективна на средних дистанциях.',
    'medical:medkit': 'Базовый медицинский набор. Восстанавливает здоровье.',
    'food:canned-meat': 'Консервированное мясо. Утоляет голод и дает силы.',
    'food:water': 'Очищенная вода. Необходима для выживания.',
    'ammo:pistol': 'Патроны для пистолета. 9мм.',
    'tool:flashlight': 'Фонарик. Помогает видеть в темных местах.',
  };
  
  return descriptions[item] || 'Предмет из пустоши. Может быть полезен.';
}

export default Inventory;
