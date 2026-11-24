import React, { useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { getPinWorldPosition } from '../../engine/catalog';
import { useGameStore } from '../../store/useGameStore';
import { SHARED_GEO } from './sharedMaterials';
import type { PlacedComponent, WireConnection } from '../../types/game';

interface JumperWireProps {
  wire: WireConnection;
  components: PlacedComponent[];
  flow: 'vcc' | 'gnd' | 'signal_high' | 'signal_low' | 'inactive';
  xray: boolean;
  isSimulating: boolean;
}

const FLOW_COLORS: Record<string, string> = {
  vcc: '#ef4444',
  gnd: '#38bdf8',
  signal_high: '#22c55e',
};

export const JumperWire: React.FC<JumperWireProps> = ({
  wire,
  components,
  flow,
  xray,
  isSimulating,
}) => {
  const [hovered, setHovered] = useState(false);
  const deleteWire = useGameStore((s) => s.deleteWire);
  const pulseGroupRef = useRef<THREE.Group>(null);

  const fromComp = components.find((c) => c.id === wire.fromComponentId);
  const toComp = components.find((c) => c.id === wire.toComponentId);

  const { start, mid, end, curve } = useMemo(() => {
    if (!fromComp || !toComp) {
      const zero = new THREE.Vector3(0, 0, 0);
      return {
        start: [0, 0, 0] as [number, number, number],
        mid: [0, 1, 0] as [number, number, number],
        end: [0, 0, 0] as [number, number, number],
        curve: new THREE.QuadraticBezierCurve3(zero, zero, zero),
      };
    }
    const s = getPinWorldPosition(fromComp, wire.fromPinId);
    const e = getPinWorldPosition(toComp, wire.toPinId);
    const dist = Math.hypot(e[0] - s[0], e[2] - s[2]);
    // Natural elevated arch clearing component housings
    const archHeight = Math.max(1.25, Math.min(3.8, 0.9 + dist * 0.24));
    const m: [number, number, number] = [
      (s[0] + e[0]) / 2,
      Math.max(s[1], e[1]) + archHeight,
      (s[2] + e[2]) / 2,
    ];
    const c = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...s),
      new THREE.Vector3(...m),
      new THREE.Vector3(...e)
    );
    return { start: s, mid: m, end: e, curve: c };
  }, [fromComp, toComp, wire.fromPinId, wire.toPinId]);

  const showXrayPulse = xray && isSimulating && flow in FLOW_COLORS;
  const pulseColor = FLOW_COLORS[flow] ?? '#22c55e';

  useFrame((state) => {
    if (!showXrayPulse || !pulseGroupRef.current) return;
    const speed = flow === 'signal_high' ? 1.15 : 0.75;
    const baseT = state.clock.elapsedTime * speed;
    pulseGroupRef.current.children.forEach((child, idx) => {
      const t = (baseT + idx / 3) % 1;
      const pt = curve.getPoint(t);
      child.position.copy(pt);
    });
  });

  if (!fromComp || !toComp) return null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    deleteWire(wire.id);
  };

  const displayColor = hovered
    ? '#f97316'
    : showXrayPulse
      ? pulseColor
      : wire.color;

  return (
    <group>
      <QuadraticBezierLine
        start={start}
        mid={mid}
        end={end}
        color={displayColor}
        lineWidth={hovered ? 4.5 : showXrayPulse ? 3.6 : 2.8}
        dashed={false}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      />

      {/* Molded DuPont Pin Connectors at Wire Ends */}
      <mesh position={[start[0], start[1] + 0.14, start[2]]}>
        <boxGeometry args={[0.2, 0.24, 0.2]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      <mesh position={[end[0], end[1] + 0.14, end[2]]}>
        <boxGeometry args={[0.2, 0.24, 0.2]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>

      {/* Lightweight X-Ray Current Flow Pulses */}
      {showXrayPulse && (
        <group ref={pulseGroupRef}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} geometry={SHARED_GEO.pulseBead}>
              <meshBasicMaterial color={pulseColor} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
