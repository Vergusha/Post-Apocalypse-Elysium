import { useState } from 'react';
import MainMenu from './screens/MainMenu';
import GameScreen from './screens/GameScreen';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {started ? <GameScreen /> : <MainMenu onStart={() => setStarted(true)} />}
    </div>
  );
}

export default App;
