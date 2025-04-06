import { useState, useEffect } from 'react';
import '../styles/QuantitySelector.css';

interface QuantitySelectorProps {
  maxQuantity: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
  defaultQuantity?: number;
  itemName: string;
  action: 'take' | 'use' | 'drop';
}

const QuantitySelector = ({
  maxQuantity,
  onConfirm,
  onCancel,
  defaultQuantity,
  itemName,
  action
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(defaultQuantity || Math.min(1, maxQuantity));
  
  // Make sure quantity stays within bounds
  useEffect(() => {
    if (quantity > maxQuantity) setQuantity(maxQuantity);
    if (quantity < 1) setQuantity(1);
  }, [quantity, maxQuantity]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.min(Math.max(1, value), maxQuantity));
    }
  };
  
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(q => q + 1);
    }
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };
  
  const getActionText = () => {
    switch (action) {
      case 'take': return 'Взять';
      case 'use': return 'Использовать';
      case 'drop': return 'Выбросить';
    }
  };
  
  return (
    <div className="quantity-selector-overlay">
      <div className="quantity-selector-container">
        <div className="quantity-selector-header">
          <h3>{getActionText()} {itemName}</h3>
        </div>
        <div className="quantity-selector-content">
          <div className="quantity-label">Выберите количество:</div>
          
          <div className="quantity-controls">
            <button 
              className="quantity-button" 
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              -
            </button>
            
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={handleChange}
              className="quantity-input"
            />
            
            <button 
              className="quantity-button"
              onClick={handleIncrement}
              disabled={quantity >= maxQuantity}
            >
              +
            </button>
          </div>
          
          <div className="quantity-max">
            Максимум: {maxQuantity}
          </div>
        </div>
        
        <div className="quantity-actions">
          <button 
            className="quantity-action-button confirm"
            onClick={() => onConfirm(quantity)}
          >
            {getActionText()}
          </button>
          <button 
            className="quantity-action-button cancel"
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySelector;
