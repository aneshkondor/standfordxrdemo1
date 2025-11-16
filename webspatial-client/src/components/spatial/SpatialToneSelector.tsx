import { RoundedBox, Text } from '@react-three/drei';
import { Interactive } from '@react-three/xr';

import type { ToneType } from '../LeftTonePanel';
import { getSpatialPose } from '../../xr/SpatialLayout';

interface SpatialToneSelectorProps {
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
}

const tonePose = getSpatialPose('tonePanel');
const tones: ToneType[] = ['Soft', 'Friendly', 'Analytical'];

export default function SpatialToneSelector({ selectedTone, onToneChange }: SpatialToneSelectorProps) {
  return (
    <group position={tonePose.position} rotation={tonePose.rotation} scale={tonePose.scale}>
      <RoundedBox args={[0.4, 0.8, 0.04]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#0c1325" transparent opacity={0.9} />
      </RoundedBox>

      <Text position={[0, 0.3, 0.025]} fontSize={0.05} color="#e3e6ff" anchorX="center" anchorY="middle">
        Tone
      </Text>

      {tones.map((tone, index) => {
        const y = 0.15 - index * 0.2;
        const selected = tone === selectedTone;

        return (
          <Interactive key={tone} onSelect={() => onToneChange(tone)}>
            <group position={[0, y, 0.02]}>
              <RoundedBox args={[0.3, 0.12, 0.02]} radius={0.03}>
                <meshStandardMaterial color={selected ? '#62d7a3' : '#1f2a44'} />
              </RoundedBox>

              <Text fontSize={0.04} color="#ffffff" anchorX="center" anchorY="middle">
                {tone}
              </Text>
            </group>
          </Interactive>
        );
      })}
    </group>
  );
}
