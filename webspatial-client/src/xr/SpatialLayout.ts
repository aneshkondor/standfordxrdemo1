import { Euler, Vector3 } from 'three';

export interface SpatialPose {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
}

const toTuple = (vector: Vector3): [number, number, number] => [
  vector.x,
  vector.y,
  vector.z
];

const toEulerTuple = (euler: Euler): [number, number, number] => [
  euler.x,
  euler.y,
  euler.z
];

const DEFAULT_LAYOUT = {
  dashboard: {
    position: toTuple(new Vector3(0, 1.5, -1.5)),
    rotation: toEulerTuple(new Euler(0, 0, 0)),
    scale: toTuple(new Vector3(1, 1, 1))
  },
  tonePanel: {
    position: toTuple(new Vector3(-0.8, 1.45, -1.3)),
    rotation: toEulerTuple(new Euler(0, 0.15, 0)),
    scale: toTuple(new Vector3(0.8, 0.8, 0.8))
  },
  robot: {
    position: toTuple(new Vector3(0, 1.2, -2.1)),
    rotation: toEulerTuple(new Euler(0, 0, 0)),
    scale: toTuple(new Vector3(0.55, 0.55, 0.55))
  }
} satisfies Record<string, SpatialPose>;

export type SpatialAnchor = keyof typeof DEFAULT_LAYOUT;

export function getSpatialPose(anchor: SpatialAnchor): SpatialPose {
  return DEFAULT_LAYOUT[anchor];
}

export function getComfortDistance(anchor: SpatialAnchor): number {
  const position = DEFAULT_LAYOUT[anchor].position;
  return Math.hypot(position[0], position[2]);
}
