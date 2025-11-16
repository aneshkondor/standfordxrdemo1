import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Controllers, Hands, XR } from '@react-three/xr';

import './App.css';
import CenterDashboard from './components/CenterDashboard';
import LeftTonePanel, { type ToneType } from './components/LeftTonePanel';
import Robot3DScene from './components/Robot3DScene';
import SpatialDashboard from './components/spatial/SpatialDashboard';
import SpatialToneSelector from './components/spatial/SpatialToneSelector';
import ImmersiveRobot from './components/spatial/ImmersiveRobot';
import { useTherapyState, getComponentVisibility } from './app-shell/TherapyStateController';
import { TherapyStateProvider } from './app-shell/TherapyStateProvider';
import { initializeAudioSystem } from './audio/initializeAudio';
import { useXRSession } from './xr/XRSessionManager';
import { useXRInputSources } from './xr/XRInputHandler';

/**
 * Main App Component (Inner)
 * Contains the UI logic that needs access to therapy state context
 */
function AppContent() {
  const { currentState, startTherapy } = useTherapyState();
  const [selectedTone, setSelectedTone] = useState<ToneType>('Friendly');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { showDashboard, showRobotScene } = getComponentVisibility(currentState);
  const therapyActive = currentState === 'active_therapy';

  const xrSession = useXRSession();
  useXRInputSources(xrSession.session);

  // Initialize audio system on mount
  useEffect(() => {
    initializeAudioSystem();
  }, []);

  /**
   * Handle tone selection change
   * Updates the selected tone when user clicks a tone button
   */
  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    console.log(`[App] Tone changed to: ${tone}`);
    setStatusMessage(`Tone set to ${tone}`);
  };

  /**
   * Handle Start Therapy button click
   * Initiates therapy session with the currently selected tone
   */
  const handleStartTherapy = () => {
    console.log(`[App] Starting therapy with tone: ${selectedTone}`);
    startTherapy(selectedTone);
    setStatusMessage(`Therapy started with ${selectedTone} tone`);
  };

  const renderSpatialExperience = () => (
    <Canvas
      className="xr-canvas"
      camera={{
        fov: 70,
        position: [0, 1.5, 0]
      }}
      shadows
    >
      <Suspense fallback={null}>
        <XR referenceSpace="local-floor">
          <color attach="background" args={['#05070f']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 2]} intensity={1} castShadow />
          <directionalLight position={[-2, 3, 1]} intensity={0.4} />

          {showDashboard && (
            <SpatialDashboard
              onStartTherapy={handleStartTherapy}
              selectedTone={selectedTone}
              statusMessage={statusMessage}
              therapyActive={therapyActive}
            />
          )}

          <SpatialToneSelector selectedTone={selectedTone} onToneChange={handleToneChange} />

          <ImmersiveRobot visible={showRobotScene} />

          <Controllers />
          <Hands />
        </XR>
      </Suspense>
    </Canvas>
  );

  const renderFallback = () => (
    <div className="fallback-ui">
      <div className="fallback-panels">
        <LeftTonePanel onToneChange={handleToneChange} initialTone={selectedTone} />
        {showDashboard && <CenterDashboard onStartTherapy={handleStartTherapy} />}
      </div>

      {showRobotScene && <Robot3DScene />}
    </div>
  );

  const handleXRButton = () => {
    if (xrSession.state === 'immersive') {
      void xrSession.endSession();
    } else {
      void xrSession.startSession();
    }
  };

  const isImmersive = xrSession.state === 'immersive';

  return (
    <div className="app-container">
      <div className={`xr-stage ${isImmersive ? 'xr-stage--active' : 'xr-stage--hidden'}`}>
        {renderSpatialExperience()}
      </div>

      {!isImmersive && renderFallback()}

      <div className="xr-overlay">
        {xrSession.isSupported ? (
          <button onClick={handleXRButton}>
            {isImmersive ? 'Exit Spatial Mode' : 'Enter Spatial Mode'}
          </button>
        ) : (
          <span>WebXR unavailable. Running in 2D mode.</span>
        )}
      </div>
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
