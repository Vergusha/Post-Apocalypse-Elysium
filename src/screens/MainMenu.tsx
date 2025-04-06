import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import '../styles/MainMenu.css';

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu = ({ onStart }: MainMenuProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const name = usePlayerStore((s) => s.name);
  const setName = usePlayerStore((s) => s.setName);
  
  // Добавляем небольшую задержку для анимации появления меню
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="main-menu-container">
      <div className="menu-overlay"></div>
      
      <div className={`menu-content ${showMenu ? 'visible' : ''}`}>
        <h1 className="game-title">Post-Apocalypse Elysium</h1>
        <div className="menu-subtitle">Выжить любой ценой</div>
        
        <input
          className="p-2 border rounded"
          placeholder="Имя персонажа"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <div className="menu-buttons">
          <button 
            onClick={onStart} 
            className="menu-button primary-button"
          >
            Начать игру
          </button>
          
          <button className="menu-button">
            Настройки
          </button>
          
          <button className="menu-button">
            Об игре
          </button>
        </div>
        
        <div className="version-info">
          Alpha v0.1
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
