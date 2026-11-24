import React, { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { HARDWARE_CATALOG, getPinWorldPosition } from '../../engine/catalog';
import { useGameStore } from '../../store/useGameStore';
import { SHARED_GEO, SHARED_MAT } from './sharedMaterials';
import type { ComponentPin, PlacedComponent } from '../../types/game';

interface PinAnchorProps {
  component: PlacedComponent;
  pin: ComponentPin;
  compact?: boolean;
}

export const PinAnchor: React.FC<PinAnchorProps> = React.memo(
  ({ component, pin, compact = false }) => {
    const [hovered, setHovered] = useState(false);

    const clickPin = useGameStore((s) => s.clickPin);
    const setHoveredPin = useGameStore((s) => s.setHoveredPin);
    const pendingWireStart = useGameStore((s) => s.pendingWireStart);
    const probeA = useGameStore((s) => s.probeA);
    const probeB = useGameStore((s) => s.probeB);
    const language = useGameStore((s) => s.language);

    const isPending =
      pendingWireStart?.componentId === component.id && pendingWireStart?.pinId === pin.id;
    const isProbeA = probeA?.componentId === component.id && probeA?.pinId === pin.id;
    const isProbeB = probeB?.componentId === component.id && probeB?.pinId === pin.id;

    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'crosshair';
      const def = HARDWARE_CATALOG[component.type];
      setHoveredPin({
        componentId: component.id,
        pinId: pin.id,
        label: pin.label,
        componentName: language === 'bm' ? def.nameBm : def.name,
        worldPos: getPinWorldPosition(component, pin.id),
      });
    };

    const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(false);
      document.body.style.cursor = 'auto';
      setHoveredPin(null);
    };

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      clickPin(component.id, pin.id);
    };

    const ringMat = isProbeA
      ? SHARED_MAT.pinRingProbeA
      : isProbeB
        ? SHARED_MAT.pinRingProbeB
        : isPending
          ? SHARED_MAT.pinRingActive
          : SHARED_MAT.pinRingHover;

    const showRing = hovered || isPending || isProbeA || isProbeB;

    return (
      <group position={pin.localPos}>
        {/* Invisible slightly larger hit target for easy Chromebook trackpad clicking */}
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          visible={false}
        >
          <cylinderGeometry args={[compact ? 0.22 : 0.28, compact ? 0.22 : 0.28, 0.52, 8]} />
          <meshBasicMaterial />
        </mesh>

        {!compact && (
          <mesh
            geometry={SHARED_GEO.pinBase}
            material={SHARED_MAT.pinShroud}
            position={[0, -0.04, 0]}
            castShadow
          />
        )}

        <mesh
          geometry={SHARED_GEO.pinPost}
          material={SHARED_MAT.pinGold}
          position={[0, compact ? 0.04 : 0.12, 0]}
          scale={compact ? [0.75, 0.55, 0.75] : [1, 1, 1]}
          castShadow
        />

        {showRing && (
          <mesh
            geometry={SHARED_GEO.pinRing}
            material={ringMat}
            position={[0, compact ? 0.14 : 0.28, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={isPending ? 1.25 : 1.05}
          />
        )}
      </group>
    );
  }
);
PinAnchor.displayName = 'PinAnchor';
