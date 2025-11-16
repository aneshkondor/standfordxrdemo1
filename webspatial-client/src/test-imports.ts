// Test file to verify WebSpatial SDK and Three.js imports
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
// @ts-expect-error - Testing import, actual API may differ
import { WebSpatialProvider } from '@webspatial/react-sdk';

// Verify Three.js types are recognized
const testVector: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

// Verify imports compile
console.log('Three.js Vector3:', testVector);
console.log('React Three Fiber Canvas:', Canvas);
console.log('WebSpatial Provider:', WebSpatialProvider);

export {};
