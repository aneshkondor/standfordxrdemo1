import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Robot3DScene Component
 *
 * Displays a 3D robot therapist in a spatial environment using Three.js
 * Currently uses placeholder geometry (sphere head + cylinder body) until
 * the team provides the USDZ file.
 */

interface RobotPlaceholderProps {
  position?: [number, number, number];
}

/**
 * RobotPlaceholder - Simple geometric representation of robot
 * Height: ~0.9 meters (3 feet)
 * Colors: Sky blue and light cyan for friendly appearance
 */
function RobotPlaceholder({ position = [0, 0, -2.75] }: RobotPlaceholderProps) {
  const robotRef = useRef<THREE.Group>(null);

  return (
    <group ref={robotRef} position={position}>
      {/* Robot Body - Cylinder */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 32]} />
        <meshStandardMaterial color="#87CEEB" /> {/* Sky blue */}
      </mesh>

      {/* Robot Head - Sphere */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#E0FFFF" /> {/* Light cyan */}
      </mesh>

      {/* Eyes - Small spheres for character */}
      <mesh position={[-0.08, 0.22, 0.15]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#1E90FF" /> {/* Dodger blue */}
      </mesh>
      <mesh position={[0.08, 0.22, 0.15]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#1E90FF" /> {/* Dodger blue */}
      </mesh>

      {/* Arms - Small cylinders */}
      <mesh position={[-0.22, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[0.22, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
    </group>
  );
}

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

        {/* Robot Placeholder - positioned 2.75 meters in front of user */}
        <RobotPlaceholder position={[0, 0, -2.75]} />

        {/* Optional grid helper for spatial reference during development */}
        <gridHelper args={[10, 10, '#444444', '#222222']} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}
