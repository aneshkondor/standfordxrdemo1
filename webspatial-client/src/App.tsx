import { useState } from 'react';
import './App.css';
import CenterDashboard from './components/CenterDashboard';
import { useTherapyState } from './app-shell/TherapyStateController';
import { TherapyStateProvider } from './app-shell/TherapyStateProvider';

/**
 * Main App Component (Inner)
 * Contains the UI logic that needs access to therapy state context
 */
function AppContent() {
  const { startTherapy } = useTherapyState();
  const [selectedTone] = useState<'Soft' | 'Friendly' | 'Analytical'>('Friendly');

  /**
   * Handle Start Therapy button click
   * Initiates therapy session with the currently selected tone
   */
  const handleStartTherapy = () => {
    startTherapy(selectedTone);
  };

  return (
    <div className="app-container">
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
