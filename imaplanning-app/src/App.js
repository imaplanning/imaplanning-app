import React from 'react';
import IMAHeader from './components/IMAHeader';
import FinancialChat from './components/FinancialChat';
import './App.css';

function App() {
  return (
    <div className="ima-app">
      <IMAHeader />
      <main className="ima-main">
        <div className="app-hero">
          <h1>Asesor Financiero IMA Planning</h1>
          <p>Te guío a través de los 4 pilares de tu seguridad financiera</p>
          <div className="hero-pillars">
            <span className="pillar-badge">🛡️ Emergencias</span>
            <span className="pillar-badge">🏥 Seguros</span>
            <span className="pillar-badge">🌴 Retiro</span>
            <span className="pillar-badge">📚 Educación</span>
          </div>
        </div>
        <FinancialChat />
      </main>
    </div>
  );
}

export default App;