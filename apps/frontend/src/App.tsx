import React from 'react';
import Chat from './components/chat';
import Silk from './components/Silk';

function App() {
  return (
    <div className="app-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Silk
        speed={6.5}
        scale={2.5}
        color="#7B7481"
        noiseIntensity={1.5}
        rotation={0}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <Chat />
      </div>
    </div>
  );
}

export default App;
