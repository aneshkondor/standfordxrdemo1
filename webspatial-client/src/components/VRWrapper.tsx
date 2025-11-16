/**
 * VR Wrapper Component
 * Handles WebXR session initialization for Vision Pro
 */

import { Canvas } from '@react-three/fiber';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import type { ReactNode } from 'react';

interface VRWrapperProps {
  children: ReactNode;
}

export function VRWrapper({ children }: VRWrapperProps) {
  return (
    <>
      {/* VR Entry Button */}
      <VRButton
        sessionInit={{
          requiredFeatures: ['local-floor', 'hand-tracking'],
          optionalFeatures: ['bounded-floor']
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          background: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 9999,
          fontWeight: 600
        }}
      />

      {/* XR-Enabled Canvas */}
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <XR>
          {/* Hand tracking for Vision Pro */}
          <Hands />
          <Controllers />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />

          {/* Scene content */}
          {children}
        </XR>
      </Canvas>
    </>
  );
}
