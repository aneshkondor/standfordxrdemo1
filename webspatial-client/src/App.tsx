import { useState } from 'react';
import './App.css';
import CenterDashboard from './components/CenterDashboard';
import LeftTonePanel, { type ToneType } from './components/LeftTonePanel';
import { useTherapyState } from './app-shell/TherapyStateController';
import { TherapyStateProvider } from './app-shell/TherapyStateProvider';

/**
 * Main App Component (Inner)
 * Contains the UI logic that needs access to therapy state context
 */
function AppContent() {
  const { startTherapy } = useTherapyState();
  const [selectedTone, setSelectedTone] = useState<ToneType>('Friendly');

  /**
   * Handle tone selection change
   * Updates the selected tone when user clicks a tone button
   */
  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    console.log(`[App] Tone changed to: ${tone}`);
  };

  /**
   * Handle Start Therapy button click
   * Initiates therapy session with the currently selected tone
   */
  const handleStartTherapy = () => {
    console.log(`[App] Starting therapy with tone: ${selectedTone}`);
    startTherapy(selectedTone);
  };

  return (
    <div className="app-container" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <LeftTonePanel onToneChange={handleToneChange} initialTone={selectedTone} />
      <CenterDashboard onStartTherapy={handleStartTherapy} />
    </div>
  );
}

/**
 * Main App Component
 * Wraps the app with TherapyStateProvider
 */
function App() {
  return (
    <TherapyStateProvider>
      <AppContent />
    </TherapyStateProvider>
  );
}

export default App;
