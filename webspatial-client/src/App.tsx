import { useState } from 'react';
import './App.css';
import CenterDashboard from './components/CenterDashboard';
import LeftTonePanel, { type ToneType } from './components/LeftTonePanel';
import Robot3DScene from './components/Robot3DScene';
import { useTherapyState, getComponentVisibility } from './app-shell/TherapyStateController';
import { TherapyStateProvider } from './app-shell/TherapyStateProvider';

/**
 * Main App Component (Inner)
 * Contains the UI logic that needs access to therapy state context
 */
function AppContent() {
  const { currentState, startTherapy } = useTherapyState();
  const [selectedTone, setSelectedTone] = useState<ToneType>('Friendly');

  // Get component visibility based on current state
  const { showDashboard, showRobotScene } = getComponentVisibility(currentState);

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
    <div className="app-container" style={{ width: '100vw', height: '100vh' }}>
      {/* Dashboard View - shown when idle */}
      {showDashboard && (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', height: '100%' }}>
          <LeftTonePanel onToneChange={handleToneChange} initialTone={selectedTone} />
          <CenterDashboard onStartTherapy={handleStartTherapy} />
        </div>
      )}

      {/* Robot Scene - shown during active therapy */}
      {showRobotScene && <Robot3DScene />}
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
