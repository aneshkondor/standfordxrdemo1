/**
 * Spatial UI Components
 * Dashboard and tone selector as 3D spatial panels
 */

import { Text, RoundedBox } from '@react-three/drei';
import { Interactive } from '@react-three/xr';
import { useState } from 'react';
import type { ToneType } from './LeftTonePanel';

interface SpatialDashboardProps {
  onStartTherapy: () => void;
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
}

export function SpatialDashboard({ onStartTherapy, selectedTone, onToneChange }: SpatialDashboardProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTone, setHoveredTone] = useState<ToneType | null>(null);

  const tones: ToneType[] = ['Soft', 'Friendly', 'Analytical'];

  return (
    <group position={[0, 1.5, -1.5]}> {/* 1.5m in front, eye level */}
      {/* Main Panel Background */}
      <RoundedBox args={[2, 1.5, 0.05]} radius={0.05}>
        <meshStandardMaterial color="#1a1a1a" opacity={0.9} transparent />
      </RoundedBox>

      {/* Title */}
      <Text
        position={[0, 0.5, 0.03]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        AI Therapy Companion
      </Text>

      {/* Tone Selector */}
      <Text
        position={[-0.7, 0.25, 0.03]}
        fontSize={0.06}
        color="#888"
        anchorX="left"
        anchorY="middle"
      >
        Select Tone:
      </Text>

      {/* Tone Buttons */}
      {tones.map((tone, index) => {
        const isSelected = selectedTone === tone;
        const isHovered = hoveredTone === tone;
        const xPos = -0.6 + (index * 0.6);

        return (
          <Interactive
            key={tone}
            onSelect={() => onToneChange(tone)}
            onHover={() => setHoveredTone(tone)}
            onBlur={() => setHoveredTone(null)}
          >
            <group position={[xPos, 0, 0.03]}>
              {/* Button Background */}
              <RoundedBox
                args={[0.5, 0.15, 0.02]}
                radius={0.02}
                position={[0, 0, 0]}
              >
                <meshStandardMaterial
                  color={isSelected ? '#007AFF' : (isHovered ? '#333' : '#222')}
                  transparent
                  opacity={isSelected ? 1 : 0.8}
                />
              </RoundedBox>

              {/* Button Text */}
              <Text
                position={[0, 0, 0.02]}
                fontSize={0.05}
                color={isSelected ? 'white' : '#aaa'}
                anchorX="center"
                anchorY="middle"
              >
                {tone}
              </Text>

              {/* Selection indicator */}
              {isSelected && (
                <Text
                  position={[0.22, 0, 0.02]}
                  fontSize={0.04}
                  color="white"
                >
                  ✓
                </Text>
              )}
            </group>
          </Interactive>
        );
      })}

      {/* Start Therapy Button */}
      <Interactive
        onSelect={onStartTherapy}
        onHover={() => setHoveredButton('start')}
        onBlur={() => setHoveredButton(null)}
      >
        <group position={[0, -0.35, 0.03]}>
          <RoundedBox args={[1.2, 0.25, 0.04]} radius={0.03}>
            <meshStandardMaterial
              color={hoveredButton === 'start' ? '#0056b3' : '#007AFF'}
              emissive={hoveredButton === 'start' ? '#003d80' : '#000'}
              emissiveIntensity={0.3}
            />
          </RoundedBox>

          <Text
            position={[0, 0, 0.03]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.woff"
          >
            Start Therapy
          </Text>
        </group>
      </Interactive>

      {/* Status Text */}
      <Text
        position={[0, -0.65, 0.03]}
        fontSize={0.04}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        Put on headset and speak naturally
      </Text>
    </group>
  );
}
