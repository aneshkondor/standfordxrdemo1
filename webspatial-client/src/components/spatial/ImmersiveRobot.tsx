import { Suspense, useMemo, useRef } from 'react';
import { Environment, useGLTF } from '@react-three/drei';
import type { Group } from 'three';

import { getSpatialPose } from '../../xr/SpatialLayout';
import { useSpatialAudioAnchor } from '../../xr/spatialAudio';

const robotPose = getSpatialPose('robot');
const ROBOT_MODEL_PATH = '/models/robot.glb';

interface ImmersiveRobotProps {
  visible: boolean;
}

export default function ImmersiveRobot({ visible }: ImmersiveRobotProps) {
  const groupRef = useRef<Group | null>(null);
  const gltf = useGLTF(ROBOT_MODEL_PATH) as { scene: Group };

  useSpatialAudioAnchor(groupRef, { refDistance: 2.2 });

  const robotScene = useMemo(() => {
    return gltf?.scene ? gltf.scene.clone() : null;
  }, [gltf]);

  if (!visible || !robotScene) {
    return null;
  }

  return (
    <group ref={groupRef} position={robotPose.position} rotation={robotPose.rotation} scale={robotPose.scale}>
      <Suspense fallback={null}>
        <primitive object={robotScene} />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#0b0f1f" opacity={0.4} transparent />
      </mesh>

      <Environment preset="sunset" />
    </group>
  );
}

useGLTF.preload(ROBOT_MODEL_PATH);
