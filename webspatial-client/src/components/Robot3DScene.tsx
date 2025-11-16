import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Robot3DScene Component
 *
 * Displays a 3D robot therapist in a spatial environment using Three.js
 * Now loads the actual USDZ-converted GLB model.
 */

const ROBOT_MODEL_PATH = `${import.meta.env.BASE_URL}models/robot.glb`.replace(/\/+/g, '/');

interface RobotModelProps {
  position?: [number, number, number];
  scale?: number;
}

/**
 * RobotModel - Loads and displays the actual robot GLB model
 * Height: Scaled to ~0.9 meters (3 feet)
 * Position: 2.75 meters in front of user for optimal viewing
 */
function RobotModel({ position = [0, 0, -2.75], scale = 0.5 }: RobotModelProps) {
  const robotRef = useRef<THREE.Group>(null);

  // Load the GLB model using useGLTF hook
  const { scene } = useGLTF(ROBOT_MODEL_PATH);

  return (
    <primitive
      ref={robotRef}
      object={scene}
      position={position}
      scale={scale}
    />
  );
}

// Preload the model to avoid loading delays
useGLTF.preload(ROBOT_MODEL_PATH);

/**
 * SceneLighting - Configures ambient and directional lights
 * Provides good visibility and depth perception
 */
function SceneLighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.6} />

      {/* Directional light for depth and visibility */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
      />

      {/* Additional fill light from the side */}
      <directionalLight
        position={[-3, 3, -3]}
        intensity={0.4}
      />
    </>
  );
}

/**
 * Robot3DScene - Main component
 * Integrates Three.js scene with WebSpatial spatial rendering
 */
export default function Robot3DScene() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 100,
          position: [0, 0, 0]
        }}
        style={{ background: '#000000' }}
      >
        {/* Scene Lighting */}
        <SceneLighting />

        {/* Suspense boundary for async model loading */}
        <Suspense fallback={null}>
          {/* Robot Model - positioned 2.75 meters in front of user */}
          <RobotModel position={[0, 0, -2.75]} scale={0.5} />
        </Suspense>

        {/* Optional grid helper for spatial reference during development */}
        <gridHelper args={[10, 10, '#444444', '#222222']} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}
