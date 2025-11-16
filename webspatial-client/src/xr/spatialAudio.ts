import { useEffect } from 'react';
import type { RefObject } from 'react';
import { AudioListener, Object3D, PositionalAudio } from 'three';
import { AudioContext as ThreeAudioContext } from 'three/src/audio/AudioContext.js';
import { useThree } from '@react-three/fiber';

import { getAudioContext, setAudioOutputNode } from '../audio/audioPlayback';

interface SpatialAudioOptions {
  refDistance?: number;
  rolloffFactor?: number;
}

/**
 * Bridges the WebAudio playback pipeline with a THREE.PositionalAudio node so the
 * robot voice emanates from its 3D location.
 */
export function useSpatialAudioAnchor(
  anchorRef: RefObject<Object3D | null>,
  { refDistance = 2, rolloffFactor = 0.9 }: SpatialAudioOptions = {}
): void {
  const { camera } = useThree();
  const anchor = anchorRef.current;

  useEffect(() => {
    if (!anchor) {
      return;
    }

    const playbackContext = getAudioContext();
    // Ensure Three.js audio utilities reuse the OpenAI playback AudioContext.
    ThreeAudioContext.setContext(playbackContext);

    const listener = new AudioListener();
    camera.add(listener);

    const positionalAudio = new PositionalAudio(listener);
    positionalAudio.setRefDistance(refDistance);
    positionalAudio.setRolloffFactor(rolloffFactor);

    anchor.add(positionalAudio);

    setAudioOutputNode(positionalAudio.getOutput());

    return () => {
      anchor.remove(positionalAudio);
      camera.remove(listener);
      setAudioOutputNode(null);
    };
  }, [anchor, camera, refDistance, rolloffFactor]);
}
