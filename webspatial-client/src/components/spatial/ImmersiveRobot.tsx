import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Environment, useGLTF } from '@react-three/drei';
import type { Group } from 'three';

import { getSpatialPose } from '../../xr/SpatialLayout';
import { useSpatialAudioAnchor } from '../../xr/spatialAudio';

const robotPose = getSpatialPose('robot');
const USDZ_PATH = '/models/ILA_Chatbot_1116011010_texture.usdz';

function useUsdModel() {
  const [usdModel, setUsdModel] = useState<Group | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUsd() {
      try {
        const { USDZLoader } = await import('three/examples/jsm/loaders/USDZLoader.js');
        const loader = new USDZLoader();
        const model = await loader.loadAsync(USDZ_PATH);
        if (isMounted) {
          setUsdModel(model);
        }
      } catch (error) {
        console.warn('[ImmersiveRobot] USDZ model load failed, using GLB fallback', error);
      }
    }

    void loadUsd();

    return () => {
      isMounted = false;
    };
  }, []);

  return usdModel;
}

interface ImmersiveRobotProps {
  visible: boolean;
}

export default function ImmersiveRobot({ visible }: ImmersiveRobotProps) {
  const groupRef = useRef<Group | null>(null);
  const usdModel = useUsdModel();
  const gltf = useGLTF('/models/robot.glb') as { scene: Group };

  useSpatialAudioAnchor(groupRef, { refDistance: 2.2 });

  const robotScene = useMemo(() => {
    const source = usdModel ?? gltf?.scene;
    return source ? source.clone() : null;
  }, [usdModel, gltf]);

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

useGLTF.preload('/models/robot.glb');
