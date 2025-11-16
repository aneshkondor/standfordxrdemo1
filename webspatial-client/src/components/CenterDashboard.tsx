import React from 'react';
import './CenterDashboard.css';

interface CenterDashboardProps {
  /**
   * Callback function triggered when the Start Therapy button is clicked
   */
  onStartTherapy: () => void;
}

/**
 * CenterDashboard Component
 *
 * Main dashboard interface for the therapy application.
 * Displays a centered "Start Therapy" button that initiates the therapy session.
 * Designed for spatial/VR environments with clear visibility.
 */
const CenterDashboard: React.FC<CenterDashboardProps> = ({ onStartTherapy }) => {
  return (
    <div className="center-dashboard-panel">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Therapy Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to your therapy session</p>

        <button
          className="start-therapy-button"
          onClick={onStartTherapy}
          aria-label="Start Therapy Session"
        >
          Start Therapy
        </button>

        <p className="dashboard-instruction">
          Click the button above to begin your therapy session
        </p>
      </div>
    </div>
  );
};

export default CenterDashboard;
