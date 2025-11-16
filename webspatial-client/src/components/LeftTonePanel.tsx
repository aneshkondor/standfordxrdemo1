import { useState } from 'react';

/**
 * Available AI therapist tone options
 */
export type ToneType = 'Soft' | 'Friendly' | 'Analytical';

/**
 * Props for the LeftTonePanel component
 */
export interface LeftTonePanelProps {
  /**
   * Callback function triggered when user selects a different tone
   * @param tone - The newly selected tone
   */
  onToneChange: (tone: ToneType) => void;

  /**
   * Optional initial tone selection (defaults to 'Friendly')
   */
  initialTone?: ToneType;
}

/**
 * LeftTonePanel - Spatial panel component for AI therapist tone selection
 *
 * Displays three tone preset buttons (Soft, Friendly, Analytical) allowing users
 * to personalize their therapy experience. Positioned on the left side of the
 * main dashboard in the spatial environment.
 */
export default function LeftTonePanel({
  onToneChange,
  initialTone = 'Friendly'
}: LeftTonePanelProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>(initialTone);

  const tones: ToneType[] = ['Soft', 'Friendly', 'Analytical'];

  /**
   * Handles tone button clicks
   */
  const handleToneSelect = (tone: ToneType) => {
    setSelectedTone(tone);
    onToneChange(tone);
  };

  return (
    <div
      className="left-tone-panel"
      style={{
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
        }}
      >
        Therapist Tone
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tones.map((tone) => {
          const isSelected = tone === selectedTone;

          return (
            <button
              key={tone}
              onClick={() => handleToneSelect(tone)}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: isSelected ? '600' : '500',
                color: isSelected ? '#fff' : '#333',
                backgroundColor: isSelected ? '#4A90E2' : '#f0f0f0',
                border: isSelected ? '2px solid #357ABD' : '2px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#e0e0e0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }
              }}
            >
              <span>{tone}</span>
              {isSelected && (
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p
        style={{
          margin: '8px 0 0 0',
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic',
        }}
      >
        Selected: {selectedTone}
      </p>
    </div>
  );
}
