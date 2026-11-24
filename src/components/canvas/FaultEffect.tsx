import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SHARED_GEO } from './sharedMaterials';

interface FaultEffectProps {
  position: [number, number, number];
}

export const FaultEffect: React.FC<FaultEffectProps> = ({ position }) => {
  const sparksRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sparksRef.current) {
      sparksRef.current.children.forEach((child, idx) => {
        const phase = (t * 3.8 + idx * 0.21) % 1;
        const angle = idx * 1.25 + Math.floor(t * 3.8) * 0.6;
        const radius = phase * 1.15;
        child.position.set(
          Math.cos(angle) * radius,
          0.2 + phase * 1.4 - phase * phase * 1.1,
          Math.sin(angle) * radius
        );
        child.scale.setScalar(1 - phase * 0.75);
      });
    }
    if (smokeRef.current) {
      smokeRef.current.children.forEach((child, idx) => {
        const phase = (t * 0.9 + idx * 0.33) % 1;
        child.position.set(
          Math.sin(t + idx) * 0.22 * phase,
          0.4 + phase * 2.4,
          Math.cos(t + idx) * 0.22 * phase
        );
        child.scale.setScalar(0.35 + phase * 0.95);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - phase) * 0.45;
      });
    }
  });

  return (
    <group position={position}>
      {/* Electric Sparks */}
      <group ref={sparksRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} geometry={SHARED_GEO.sparkParticle}>
            <meshBasicMaterial color={i % 2 === 0 ? '#fde047' : '#f97316'} />
          </mesh>
        ))}
      </group>

      {/* Dark Smoke Puffs */}
      <group ref={smokeRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshBasicMaterial color="#334155" transparent opacity={0.4} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
